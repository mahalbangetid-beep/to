import {
  Controller, Get, UseGuards, Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from '../orders/orders.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get('overview')
  async getOverview(@Request() req: any) {
    const userId = req.user.id;

    const [orderResult, activeSubscriptions] = await Promise.all([
      this.ordersService.findByUser(userId, { page: 1, limit: 5 }),
      this.subscriptionsService.findActiveByUser(userId),
    ]);

    return {
      stats: {
        totalOrders: orderResult.pagination.total,
        activeProducts: activeSubscriptions.length,
      },
      recentOrders: orderResult.orders,
      activeSubscriptions,
    };
  }

  @Get('products')
  async getMyProducts(@Request() req: any) {
    const subs = await this.subscriptionsService.findByUser(req.user.id);

    return {
      products: subs.map((sub) => ({
        id: sub.id,
        productId: sub.productId,
        productName: (sub as any).product?.name || `Product #${sub.productId.slice(0, 8)}`,
        productSlug: (sub as any).product?.slug || null,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        accessInfo: sub.accessInfo,
        daysRemaining: sub.endDate
          ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : null,
      })),
    };
  }
}
