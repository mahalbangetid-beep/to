import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, Request, Ip, Headers, NotFoundException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, OrderQueryDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Body() dto: CreateOrderDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Request() req: any,
  ) {
    // Check if user is authenticated (optional — supports guest checkout)
    const userId = req.user?.id || undefined;
    return this.ordersService.create(dto, userId, ip, userAgent);
  }

  @Get('track/:orderNumber')
  async trackOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyOrders(@Request() req: any, @Query() query: OrderQueryDto) {
    return this.ordersService.findByUser(req.user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/:orderNumber')
  async getMyOrderDetail(@Request() req: any, @Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumberForUser(orderNumber, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOrder(@Request() req: any, @Param('id') id: string) {
    const order = await this.ordersService.findById(id);
    // Ownership check — users can only view their own orders
    if (order.userId && order.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      throw new NotFoundException('Order tidak ditemukan');
    }
    return order;
  }
}
