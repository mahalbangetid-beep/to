import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fulfillment } from './entities/fulfillment.entity';
import { DeliveryLog } from './entities/delivery-log.entity';
import { OrdersService } from '../orders/orders.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class FulfillmentsService {
  private readonly logger = new Logger(FulfillmentsService.name);

  constructor(
    @InjectRepository(Fulfillment)
    private readonly fulfillmentRepo: Repository<Fulfillment>,
    @InjectRepository(DeliveryLog)
    private readonly deliveryLogRepo: Repository<DeliveryLog>,
    private readonly ordersService: OrdersService,
    private readonly emailService: EmailService,
  ) {}

  // ─── CREATE FULFILLMENT ──────────────────────────────────

  async createFromOrder(orderId: string): Promise<Fulfillment> {
    const order = await this.ordersService.findById(orderId);

    const existing = await this.fulfillmentRepo.findOne({ where: { orderId } });
    if (existing) {
      this.logger.warn(`Fulfillment already exists for order ${order.orderNumber}`);
      return existing;
    }

    const fulfillment = new Fulfillment();
    fulfillment.orderId = orderId;
    fulfillment.orderItemId = order.items?.[0]?.id || null as any;
    fulfillment.type = 'semi_auto';
    fulfillment.status = 'pending';
    fulfillment.processedBy = null as any;

    const saved = await this.fulfillmentRepo.save(fulfillment);

    await this.logDeliveryAction(saved.id, 'fulfillment_created', null, JSON.stringify({
      orderId, orderNumber: order.orderNumber, type: fulfillment.type,
    }));

    this.logger.log(`Fulfillment created for order ${order.orderNumber} (${fulfillment.type})`);
    return saved;
  }

  // ─── AUTO FULFILL ────────────────────────────────────────

  async autoFulfill(orderId: string): Promise<Fulfillment | null> {
    let fulfillment = await this.fulfillmentRepo.findOne({ where: { orderId } });
    if (!fulfillment) {
      fulfillment = await this.createFromOrder(orderId);
    }

    if (fulfillment.type !== 'auto') return fulfillment;

    fulfillment.status = 'completed';
    fulfillment.completedAt = new Date();
    fulfillment.deliveryContent = {
      type: 'auto',
      message: 'Produk telah dikirim secara otomatis.',
    };

    await this.fulfillmentRepo.save(fulfillment);
    await this.logDeliveryAction(fulfillment.id, 'auto_delivered', null, 'Auto-fulfillment completed');

    await this.ordersService.markCompleted(orderId);
    this.logger.log(`Order ${orderId} auto-fulfilled`);
    return fulfillment;
  }

  // ─── MANUAL / SEMI-AUTO FULFILL ──────────────────────────

  async assignToAdmin(fulfillmentId: string, adminId: string): Promise<Fulfillment> {
    const fulfillment = await this.findById(fulfillmentId);
    fulfillment.processedBy = adminId;
    fulfillment.status = 'processing';

    await this.fulfillmentRepo.save(fulfillment);
    await this.logDeliveryAction(fulfillment.id, 'assigned', adminId, `Assigned to ${adminId}`);
    return fulfillment;
  }

  async inputDeliveryContent(
    fulfillmentId: string,
    adminId: string,
    content: Record<string, any>,
    notes?: string,
  ): Promise<Fulfillment> {
    const fulfillment = await this.findById(fulfillmentId);

    if (fulfillment.status === 'completed') {
      throw new BadRequestException('Fulfillment sudah dikirim');
    }

    fulfillment.deliveryContent = content;
    fulfillment.status = 'processing';
    if (notes) fulfillment.notes = notes;

    await this.fulfillmentRepo.save(fulfillment);
    await this.logDeliveryAction(fulfillment.id, 'content_input', adminId,
      `Content keys: ${Object.keys(content).join(', ')}`);
    return fulfillment;
  }

  async sendDelivery(
    fulfillmentId: string,
    adminId: string,
  ): Promise<Fulfillment> {
    const fulfillment = await this.findById(fulfillmentId);

    if (!fulfillment.deliveryContent) {
      throw new BadRequestException('Delivery content belum diisi');
    }

    fulfillment.status = 'completed';
    fulfillment.completedAt = new Date();
    fulfillment.processedBy = adminId;
    fulfillment.processedAt = new Date();

    await this.fulfillmentRepo.save(fulfillment);
    await this.logDeliveryAction(fulfillment.id, 'delivered', adminId, 'Delivery sent');

    await this.ordersService.markCompleted(fulfillment.orderId);

    // Send delivery notification email
    try {
      const order = await this.ordersService.findById(fulfillment.orderId);
      const email = order.guestEmail || (order as any).user?.email;
      if (email) {
        await this.emailService.sendDeliveryNotification(
          email,
          {
            orderNumber: order.orderNumber,
            productName: order.items?.[0]?.productName || 'Produk Digital',
          },
        );
      }
    } catch (emailErr) {
      this.logger.warn(`Failed to send delivery email for ${fulfillmentId}: ${emailErr}`);
    }

    this.logger.log(`Fulfillment ${fulfillmentId} delivered by admin ${adminId}`);
    return fulfillment;
  }

  // ─── QUERIES ──────────────────────────────────────────────

  async findById(id: string): Promise<Fulfillment> {
    const fulfillment = await this.fulfillmentRepo.findOne({ where: { id } });
    if (!fulfillment) throw new NotFoundException('Fulfillment tidak ditemukan');
    return fulfillment;
  }

  async findByOrderId(orderId: string): Promise<Fulfillment | null> {
    return this.fulfillmentRepo.findOne({ where: { orderId } });
  }

  async findPending(page = 1, limit = 20) {
    const [fulfillments, total] = await this.fulfillmentRepo.findAndCount({
      where: [{ status: 'pending' }, { status: 'processing' }],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      fulfillments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAll(status?: string, page = 1, limit = 20) {
    const qb = this.fulfillmentRepo
      .createQueryBuilder('f')
      .orderBy('f.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      qb.andWhere('f.status = :status', { status });
    }

    const [fulfillments, total] = await qb.getManyAndCount();
    return {
      fulfillments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── HELPERS ──────────────────────────────────────────────

  private async logDeliveryAction(
    fulfillmentId: string,
    action: string,
    performedBy: string | null,
    content: string,
  ): Promise<void> {
    const log = new DeliveryLog();
    log.fulfillmentId = fulfillmentId;
    log.action = action;
    log.performedBy = performedBy as any;
    log.content = content;
    await this.deliveryLogRepo.save(log);
  }
}
