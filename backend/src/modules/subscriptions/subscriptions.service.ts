import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly repo: Repository<Subscription>,
  ) {}

  // ─── CREATE SUBSCRIPTION ─────────────────────────────────

  async createFromOrder(data: {
    userId: string;
    orderItemId?: string;
    productId: string;
    durationDays: number;
    accessInfo?: Record<string, any>;
  }): Promise<Subscription> {
    const sub = new Subscription();
    sub.userId = data.userId;
    sub.productId = data.productId;
    sub.orderItemId = data.orderItemId || null as any;
    sub.startDate = new Date();

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + data.durationDays);
    sub.endDate = endDate;

    sub.status = 'active';
    sub.accessInfo = data.accessInfo || {};

    const saved = await this.repo.save(sub);
    this.logger.log(`Subscription created: user=${data.userId}, product=${data.productId}, days=${data.durationDays}`);
    return saved;
  }

  // ─── QUERIES ──────────────────────────────────────────────

  async findByUser(userId: string): Promise<Subscription[]> {
    return this.repo.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByUser(userId: string): Promise<Subscription[]> {
    return this.repo.find({
      where: {
        userId,
        status: 'active',
        endDate: MoreThan(new Date()),
      },
      relations: ['product'],
      order: { endDate: 'ASC' },
    });
  }

  async findById(id: string): Promise<Subscription> {
    const sub = await this.repo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription tidak ditemukan');
    return sub;
  }

  // ─── STATUS MANAGEMENT ──────────────────────────────────

  async checkExpired(): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .update(Subscription)
      .set({ status: 'expired' })
      .where('status = :status', { status: 'active' })
      .andWhere('end_date < :now', { now: new Date() })
      .execute();

    const count = result.affected || 0;
    if (count > 0) {
      this.logger.log(`${count} subscriptions expired`);
    }
    return count;
  }

  async renew(
    subscriptionId: string,
    additionalDays: number,
  ): Promise<Subscription> {
    const sub = await this.findById(subscriptionId);

    const baseDate = sub.endDate > new Date() ? sub.endDate : new Date();
    const newEnd = new Date(baseDate);
    newEnd.setDate(newEnd.getDate() + additionalDays);

    sub.endDate = newEnd;
    sub.status = 'active';

    const saved = await this.repo.save(sub);
    this.logger.log(`Subscription ${subscriptionId} renewed +${additionalDays} days`);
    return saved;
  }

  async cancel(subscriptionId: string): Promise<Subscription> {
    const sub = await this.findById(subscriptionId);
    sub.status = 'suspended';
    return this.repo.save(sub);
  }
}
