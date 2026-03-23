import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { AdminModule } from './modules/admin/admin.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { FulfillmentsModule } from './modules/fulfillments/fulfillments.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PromoModule } from './modules/promo/promo.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { ClaimsModule } from './modules/claims/claims.module';
import { AuditModule } from './modules/audit/audit.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    // Environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting — 60 requests per minute per IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),

    // Database (TypeORM + PostgreSQL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // Feature modules
    AuthModule,
    ProductsModule,
    AdminModule,
    OrdersModule,
    PaymentsModule,
    FulfillmentsModule,
    SubscriptionsModule,
    DashboardModule,
    NotificationsModule,
    PromoModule,
    ReviewsModule,
    TicketsModule,
    ClaimsModule,
    AuditModule,
    WishlistModule,
    EmailModule,
  ],
  controllers: [],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
