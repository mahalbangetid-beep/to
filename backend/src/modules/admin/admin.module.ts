import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminStatsService } from './admin-stats.service';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { FulfillmentsModule } from '../fulfillments/fulfillments.module';
import { UsersModule } from '../users/users.module';
import { PromoModule } from '../promo/promo.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { TicketsModule } from '../tickets/tickets.module';
import { ClaimsModule } from '../claims/claims.module';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Fulfillment } from '../fulfillments/entities/fulfillment.entity';
import { Claim } from '../claims/entities/claim.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Product, Fulfillment, Claim]),
    ProductsModule,
    OrdersModule,
    FulfillmentsModule,
    UsersModule,
    PromoModule,
    ReviewsModule,
    TicketsModule,
    ClaimsModule,
  ],
  controllers: [AdminController],
  providers: [AdminStatsService],
})
export class AdminModule {}
