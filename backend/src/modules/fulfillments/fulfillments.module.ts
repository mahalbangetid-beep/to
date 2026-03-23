import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fulfillment } from './entities/fulfillment.entity';
import { DeliveryLog } from './entities/delivery-log.entity';
import { FulfillmentsService } from './fulfillments.service';
import { FulfillmentsController } from './fulfillments.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fulfillment, DeliveryLog]),
    OrdersModule,
  ],
  controllers: [FulfillmentsController],
  providers: [FulfillmentsService],
  exports: [FulfillmentsService],
})
export class FulfillmentsModule {}
