import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  // ─── CREATE ──────────────────────────────────────────────

  async create(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  }): Promise<Notification> {
    const notif = new Notification();
    notif.userId = params.userId;
    notif.type = params.type;
    notif.title = params.title;
    notif.message = params.message;
    notif.data = params.data || {};

    const saved = await this.repo.save(notif);
    this.logger.debug(`Notification sent to user ${params.userId}: ${params.title}`);
    return saved;
  }

  // ─── EVENT-BASED AUTO CREATE ──────────────────────────────

  async onOrderPaid(userId: string, orderNumber: string) {
    return this.create({
      userId,
      type: 'order',
      title: 'Pembayaran Berhasil!',
      message: `Pesanan ${orderNumber} telah dibayar. Produk akan segera dikirim.`,
      data: { orderNumber, actionUrl: `/dashboard/orders/detail?id=${orderNumber}` },
    });
  }

  async onOrderCompleted(userId: string, orderNumber: string) {
    return this.create({
      userId,
      type: 'order',
      title: 'Pesanan Selesai! 🎉',
      message: `Pesanan ${orderNumber} sudah selesai. Cek dashboard untuk akses produk.`,
      data: { orderNumber, actionUrl: '/dashboard/products' },
    });
  }

  async onSubscriptionExpiring(userId: string, productName: string, daysLeft: number) {
    return this.create({
      userId,
      type: 'subscription',
      title: 'Langganan Segera Habis ⏰',
      message: `${productName} akan berakhir dalam ${daysLeft} hari. Perpanjang sekarang!`,
      data: { productName, daysLeft, actionUrl: '/dashboard/products' },
    });
  }

  async onPromoAvailable(userId: string, promoCode: string, discount: string) {
    return this.create({
      userId,
      type: 'promo',
      title: 'Promo Spesial! 🎫',
      message: `Gunakan kode ${promoCode} untuk diskon ${discount}. Berlaku terbatas!`,
      data: { promoCode, discount, actionUrl: '/products' },
    });
  }

  // ─── QUERIES ──────────────────────────────────────────────

  async findByUser(userId: string, page = 1, limit = 20) {
    const [notifications, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const unreadCount = await this.repo.count({
      where: { userId, isRead: false },
    });

    return {
      notifications,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    const notif = await this.repo.findOne({ where: { id, userId } });
    if (!notif) throw new NotFoundException('Notifikasi tidak ditemukan');
    notif.isRead = true;
    await this.repo.save(notif);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('user_id = :userId', { userId })
      .andWhere('is_read = :isRead', { isRead: false })
      .execute();
    return result.affected || 0;
  }
}
