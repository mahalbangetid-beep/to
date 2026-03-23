import {
  Controller, Post, Get, Param, Body, Logger, HttpCode,
  Inject, forwardRef,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * Midtrans Webhook / Notification Handler
   * POST /api/payments/webhook
   */
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() notification: Record<string, any>) {
    this.logger.log(`Webhook received: ${JSON.stringify(notification).substring(0, 200)}`);

    const result = await this.paymentsService.handleWebhook(notification);

    if (result) {
      // Update order status based on payment
      await this.ordersService.updateStatusFromPayment(
        result.orderId,
        result.status,
        result.paymentMethod,
      );
    }

    return { status: 'ok' };
  }

  /**
   * Get payment status for an order
   */
  @Get('status/:orderNumber')
  async getPaymentStatus(@Param('orderNumber') orderNumber: string) {
    const payment = await this.paymentsService.findByExternalId(orderNumber);

    if (!payment) {
      return { status: 'not_found' };
    }

    const order = await this.ordersService.findByOrderNumber(orderNumber);

    return {
      payment: {
        status: payment.status,
        method: payment.method,
        amount: payment.amount,
        paymentUrl: payment.paymentUrl,
        paidAt: payment.paidAt,
        expiredAt: payment.expiredAt,
      },
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalPrice: order.totalPrice,
        finalPrice: order.finalPrice,
        items: order.items,
      },
    };
  }

  /**
   * Simulate payment (DEV ONLY)
   * POST /api/payments/simulate/:orderNumber
   */
  @Post('simulate/:orderNumber')
  async simulatePayment(@Param('orderNumber') orderNumber: string) {
    const payment = await this.paymentsService.simulatePayment(orderNumber);

    if (payment) {
      await this.ordersService.updateStatusFromPayment(
        payment.orderId,
        'paid',
        'simulation',
      );
      return { status: 'paid', message: 'Payment simulated successfully' };
    }

    return { status: 'not_found', message: 'Payment not found' };
  }
}
