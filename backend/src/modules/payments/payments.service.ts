import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { getMidtransConfig } from '../../config/midtrans.config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const midtransClient = require('midtrans-client');

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private snap: any;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(PaymentLog)
    private readonly paymentLogRepo: Repository<PaymentLog>,
    private readonly configService: ConfigService,
  ) {
    const config = getMidtransConfig(this.configService);

    if (config.serverKey) {
      this.snap = new midtransClient.Snap({
        isProduction: config.isProduction,
        serverKey: config.serverKey,
        clientKey: config.clientKey,
      });
      this.logger.log('Midtrans Snap client initialized');
    } else {
      this.logger.warn('Midtrans server key not set — payment creation will be simulated');
    }
  }

  // ─── CREATE SNAP TRANSACTION ─────────────────────────────

  async createTransaction(data: {
    orderId: string;
    orderNumber: string;
    amount: number;
    customerEmail?: string;
    customerPhone?: string;
    customerName?: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
  }): Promise<Payment> {
    // Create payment record
    const payment = new Payment();
    payment.orderId = data.orderId;
    payment.amount = data.amount;
    payment.status = 'pending';

    if (this.snap) {
      try {
        const snapParams = {
          transaction_details: {
            order_id: data.orderNumber,
            gross_amount: data.amount,
          },
          item_details: data.items.map((item) => ({
            id: item.id,
            name: item.name.substring(0, 50),
            price: item.price,
            quantity: item.quantity,
          })),
          customer_details: {
            email: data.customerEmail || undefined,
            phone: data.customerPhone || undefined,
            first_name: data.customerName || 'Customer',
          },
          callbacks: {
            finish: `${this.configService.get('FRONTEND_URL')}/dashboard/orders/detail?id=${data.orderNumber}`,
          },
        };

        const snapResponse = await this.snap.createTransaction(snapParams);

        payment.externalId = data.orderNumber;
        payment.paymentUrl = snapResponse.redirect_url;
        payment.rawResponse = snapResponse;

        this.logger.log(`Midtrans transaction created: ${data.orderNumber}`);
      } catch (error: any) {
        this.logger.error(`Midtrans error: ${error.message}`, error.stack);
        // Save payment even if Midtrans fails — can retry
        payment.status = 'failed';
        payment.rawResponse = { error: error.message };
      }
    } else {
      // Simulation mode (no Midtrans key)
      payment.externalId = data.orderNumber;
      payment.paymentUrl = `/dashboard/orders/detail?id=${data.orderNumber}&simulate=true`;
      payment.rawResponse = { mode: 'simulation' };
      this.logger.warn(`Payment simulated for order: ${data.orderNumber}`);
    }

    const savedPayment = await this.paymentRepo.save(payment);

    // Log the creation
    await this.logPaymentEvent(savedPayment.id, 'transaction_created', {
      orderNumber: data.orderNumber,
      amount: data.amount,
    });

    return savedPayment;
  }

  // ─── WEBHOOK HANDLER ─────────────────────────────────────

  async handleWebhook(notification: Record<string, any>): Promise<{
    orderId: string;
    status: string;
    paymentMethod: string;
  } | null> {
    const orderNumber = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const paymentType = notification.payment_type;

    this.logger.log(
      `Webhook received: order=${orderNumber}, status=${transactionStatus}, fraud=${fraudStatus}`,
    );

    const payment = await this.paymentRepo.findOne({
      where: { externalId: orderNumber },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for order: ${orderNumber}`);
      return null;
    }

    // Log raw webhook
    await this.logPaymentEvent(payment.id, 'webhook_received', notification);

    // Determine status
    let newStatus = payment.status;

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || !fraudStatus) {
        newStatus = 'paid';
        payment.paidAt = new Date();
        payment.method = paymentType;
      } else {
        newStatus = 'failed';
      }
    } else if (transactionStatus === 'pending') {
      newStatus = 'pending';
    } else if (
      transactionStatus === 'deny' ||
      transactionStatus === 'cancel' ||
      transactionStatus === 'failure'
    ) {
      newStatus = 'failed';
    } else if (transactionStatus === 'expire') {
      newStatus = 'expired';
      payment.expiredAt = new Date();
    } else if (transactionStatus === 'refund' || transactionStatus === 'partial_refund') {
      newStatus = 'refunded';
    }

    if (newStatus !== payment.status) {
      const oldStatus = payment.status;
      payment.status = newStatus;
      await this.paymentRepo.save(payment);

      await this.logPaymentEvent(payment.id, 'status_changed', {
        from: oldStatus,
        to: newStatus,
        transactionStatus,
      });
    }

    return {
      orderId: payment.orderId,
      status: newStatus,
      paymentMethod: paymentType || payment.method || '',
    };
  }

  // ─── QUERIES ──────────────────────────────────────────────

  async findByOrderId(orderId: string): Promise<Payment | null> {
    return this.paymentRepo.findOne({ where: { orderId } });
  }

  async findByExternalId(externalId: string): Promise<Payment | null> {
    return this.paymentRepo.findOne({ where: { externalId } });
  }

  // ─── SIMULATE PAYMENT (DEV ONLY) ─────────────────────────

  async simulatePayment(orderNumber: string): Promise<Payment | null> {
    const payment = await this.paymentRepo.findOne({
      where: { externalId: orderNumber },
    });

    if (!payment) return null;

    payment.status = 'paid';
    payment.paidAt = new Date();
    payment.method = 'simulation';

    await this.paymentRepo.save(payment);
    await this.logPaymentEvent(payment.id, 'simulated_payment', { orderNumber });

    return payment;
  }

  // ─── HELPERS ──────────────────────────────────────────────

  private async logPaymentEvent(
    paymentId: string,
    eventType: string,
    rawData: Record<string, any>,
  ): Promise<void> {
    const log = new PaymentLog();
    log.paymentId = paymentId;
    log.eventType = eventType;
    log.rawData = rawData;
    await this.paymentLogRepo.save(log);
  }
}
