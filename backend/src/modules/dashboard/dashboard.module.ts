import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { OrdersModule } from '../orders/orders.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [OrdersModule, SubscriptionsModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
