import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Fulfillment } from '../fulfillments/entities/fulfillment.entity';
import { Claim } from '../claims/entities/claim.entity';

@Injectable()
export class AdminStatsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Fulfillment)
    private readonly fulfillmentRepo: Repository<Fulfillment>,
    @InjectRepository(Claim)
    private readonly claimRepo: Repository<Claim>,
  ) {}

  async getDashboardStats() {
    const [totalOrders, totalRevenue, totalUsers, totalProducts, pendingFulfillments, pendingClaims, recentOrders] =
      await Promise.all([
        this.orderRepo.count(),
        this.orderRepo
          .createQueryBuilder('o')
          .select('COALESCE(SUM(o.final_price), 0)', 'total')
          .where('o.status IN (:...statuses)', { statuses: ['paid', 'completed'] })
          .getRawOne(),
        this.userRepo.count(),
        this.productRepo.count({ where: { status: 'active' } }),
        this.fulfillmentRepo.count({ where: [{ status: 'pending' }, { status: 'processing' }] }),
        this.claimRepo.count({ where: { status: 'pending' } }),
        this.orderRepo.find({
          relations: ['items'],
          order: { createdAt: 'DESC' },
          take: 10,
        }),
      ]);

    // Orders by status
    const ordersByStatus = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.status')
      .getRawMany();

    // Revenue last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueByDay = await this.orderRepo
      .createQueryBuilder('o')
      .select("TO_CHAR(o.created_at, 'YYYY-MM-DD')", 'date')
      .addSelect('COALESCE(SUM(o.final_price), 0)', 'revenue')
      .addSelect('COUNT(*)', 'orders')
      .where('o.status IN (:...statuses)', { statuses: ['paid', 'completed'] })
      .andWhere('o.created_at >= :since', { since: sevenDaysAgo })
      .groupBy("TO_CHAR(o.created_at, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(o.created_at, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    return {
      stats: {
        totalOrders,
        totalRevenue: Number(totalRevenue?.total || 0),
        totalUsers,
        totalProducts,
        pendingFulfillments,
        pendingClaims,
      },
      ordersByStatus: ordersByStatus.reduce(
        (acc: Record<string, number>, row: any) => {
          acc[row.status] = Number(row.count);
          return acc;
        },
        {},
      ),
      revenueByDay,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        finalPrice: o.finalPrice,
        createdAt: o.createdAt,
        items: o.items?.map((i) => ({
          productName: i.productName,
          variantName: i.variantName,
        })),
      })),
    };
  }
}
