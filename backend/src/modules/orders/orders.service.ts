import {
  Injectable, NotFoundException, BadRequestException, Logger,
  Inject, forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsService } from '../products/products.service';
import { PaymentsService } from '../payments/payments.service';
import { PromoService } from '../promo/promo.service';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../email/email.service';
import { CreateOrderDto, OrderQueryDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    private readonly productsService: ProductsService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
    @Inject(forwardRef(() => PromoService))
    private readonly promoService: PromoService,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
  ) {}

  // ─── CREATE ORDER ────────────────────────────────────────

  async create(
    dto: CreateOrderDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Validate items
    if (!dto.items?.length) {
      throw new BadRequestException('Minimal 1 item dalam order');
    }

    // Build order items and calculate total
    let totalPrice = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of dto.items) {
      const product = await this.productsService.adminFindById(item.productId);

      let variant = null;
      let price = product.basePrice;
      let variantName = null;

      if (item.variantId) {
        variant = product.variants?.find((v) => v.id === item.variantId);
        if (!variant) {
          throw new BadRequestException(`Varian tidak ditemukan untuk produk: ${product.name}`);
        }
        if (!variant.isActive) {
          throw new BadRequestException(`Varian sudah tidak tersedia: ${variant.name}`);
        }
        // Check stock
        if (variant.stock !== -1 && variant.stock < (item.quantity || 1)) {
          throw new BadRequestException(`Stok tidak cukup untuk ${variant.name}`);
        }
        price = Number(variant.price);
        variantName = variant.name;
      }

      const quantity = item.quantity || 1;
      totalPrice += price * quantity;

      orderItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name,
        variantName,
        price,
        quantity,
        fieldValues: item.fieldValues || {},
      } as any);
    }

    // Apply promo code
    let discountAmount = 0;
    let promoCodeId = null;

    if (dto.promoCode) {
      try {
        const promoResult = await this.promoService.validate(
          {
            code: dto.promoCode,
            cartTotal: totalPrice,
            productIds: orderItems.map((item) => item.productId!),
          },
          userId,
        );
        discountAmount = promoResult.discountAmount;
        promoCodeId = promoResult.promoId;
        this.logger.log(`Promo "${dto.promoCode}" applied: -Rp${discountAmount}`);
      } catch (err) {
        this.logger.warn(`Promo "${dto.promoCode}" failed: ${(err as any).message}`);
        // Don't block order if promo fails — just skip discount
      }
    }

    const finalPrice = totalPrice - discountAmount;

    // Generate order number
    const orderNumber = this.generateOrderNumber();

    // Create order
    const order = new Order();
    order.orderNumber = orderNumber;
    order.userId = userId || null as any;
    order.guestEmail = dto.guestEmail || null as any;
    order.guestPhone = dto.guestPhone || null as any;
    order.status = 'pending';
    order.totalPrice = totalPrice;
    order.discountAmount = discountAmount;
    order.finalPrice = finalPrice;
    order.promoCodeId = promoCodeId as any;
    order.notes = dto.notes || null as any;
    order.customerData = {};
    order.ipAddress = ipAddress || null as any;
    order.userAgent = userAgent || null as any;

    // Set expiry (24 hours)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    order.expiredAt = expiryDate;

    const savedOrder = await this.orderRepo.save(order);

    // Create order items
    for (const item of orderItems) {
      const orderItem = new OrderItem();
      orderItem.orderId = savedOrder.id;
      orderItem.productId = item.productId!;
      orderItem.variantId = item.variantId as any;
      orderItem.productName = item.productName!;
      orderItem.variantName = item.variantName as any;
      orderItem.price = item.price!;
      orderItem.quantity = item.quantity!;
      orderItem.fieldValues = item.fieldValues as any;
      await this.orderItemRepo.save(orderItem);
    }

    // Create payment via Midtrans
    const payment = await this.paymentsService.createTransaction({
      orderId: savedOrder.id,
      orderNumber,
      amount: finalPrice,
      customerEmail: dto.guestEmail || undefined,
      customerPhone: dto.guestPhone || undefined,
      items: orderItems.map((item) => ({
        id: item.productId!,
        name: item.productName!,
        price: Number(item.price),
        quantity: item.quantity!,
      })),
    });

    // Return order with payment info
    const fullOrder = await this.findById(savedOrder.id);

    // Audit log
    this.auditService.log({
      userId: userId || undefined,
      action: 'order.created',
      entityType: 'order',
      entityId: savedOrder.id,
      newData: { orderNumber: savedOrder.orderNumber, finalPrice: savedOrder.finalPrice, ipAddress },
    }).catch(() => {});

    // Send order confirmation email
    const customerEmail = savedOrder.guestEmail;
    if (customerEmail) {
      this.emailService.sendOrderConfirmation(customerEmail, {
        orderNumber: savedOrder.orderNumber,
        productName: orderItems.map(i => i.productName).join(', '),
        totalPrice: Number(savedOrder.finalPrice),
        paymentUrl: payment.paymentUrl,
      }).catch(() => {});
    }

    return {
      order: fullOrder,
      payment: {
        id: payment.id,
        paymentUrl: payment.paymentUrl,
        amount: payment.amount,
        status: payment.status,
        externalId: payment.externalId,
      },
    };
  }

  // ─── STATUS MANAGEMENT ──────────────────────────────────

  async updateStatusFromPayment(
    orderId: string,
    paymentStatus: string,
    paymentMethod: string,
  ): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    if (paymentStatus === 'paid') {
      order.status = 'paid';
      order.paidAt = new Date();
      this.logger.log(`Order ${order.orderNumber} marked as paid via ${paymentMethod}`);

      // Increment promo usage if promo was applied
      if (order.promoCodeId) {
        await this.promoService.incrementUsage(order.promoCodeId);
      }

      // Send payment success email
      const orderWithItems = await this.orderRepo.findOne({
        where: { id: orderId },
        relations: ['items', 'user'],
      });
      const productNames = orderWithItems?.items?.map(i => i.productName).join(', ') || 'Pesanan Anda';
      const recipientEmail = orderWithItems?.guestEmail || orderWithItems?.user?.email;
      if (recipientEmail) {
        this.emailService.sendPaymentSuccess(recipientEmail, {
          orderNumber: order.orderNumber,
          productName: productNames,
        }).catch(() => {});
      }
    } else if (paymentStatus === 'expired') {
      order.status = 'expired';
      this.logger.log(`Order ${order.orderNumber} expired`);
    } else if (paymentStatus === 'failed') {
      order.status = 'failed';
      this.logger.log(`Order ${order.orderNumber} failed`);
    }

    const saved = await this.orderRepo.save(order);

    // Audit log
    this.auditService.log({
      action: `order.${paymentStatus}`,
      entityType: 'order',
      entityId: orderId,
      newData: { status: paymentStatus, paymentMethod },
    }).catch(() => {});

    return saved;
  }

  async markCompleted(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    order.status = 'completed';
    order.completedAt = new Date();
    return this.orderRepo.save(order);
  }

  // ─── QUERIES ──────────────────────────────────────────────

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { orderNumber },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    return order;
  }

  async findByOrderNumberForUser(orderNumber: string, userId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { orderNumber, userId },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    return order;
  }

  async findByUser(userId: string, query: OrderQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 50);

    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'items')
      .where('o.user_id = :userId', { userId })
      .orderBy('o.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      qb.andWhere('o.status = :status', { status: query.status });
    }

    const [orders, total] = await qb.getManyAndCount();

    return {
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByEmail(email: string, query: OrderQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 50);

    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'items')
      .where('o.guest_email = :email', { email })
      .orderBy('o.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      qb.andWhere('o.status = :status', { status: query.status });
    }

    const [orders, total] = await qb.getManyAndCount();

    return {
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Admin: all orders
  async adminFindAll(query: OrderQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'items')
      .orderBy('o.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      qb.andWhere('o.status = :status', { status: query.status });
    }

    const [orders, total] = await qb.getManyAndCount();

    return {
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── HELPERS ──────────────────────────────────────────────

  private generateOrderNumber(): string {
    const now = new Date();
    const date = now.toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `TD-${date}-${random}`;
  }
}
