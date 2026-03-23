import {
  Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { FulfillmentsService } from './fulfillments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('fulfillments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class FulfillmentsController {
  constructor(private readonly fulfillmentsService: FulfillmentsService) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('page') page?: number,
  ) {
    return this.fulfillmentsService.findAll(status, page || 1);
  }

  @Get('pending')
  async findPending(@Query('page') page?: number) {
    return this.fulfillmentsService.findPending(page || 1);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.fulfillmentsService.findById(id);
  }

  @Post('order/:orderId')
  async createFromOrder(@Param('orderId') orderId: string) {
    return this.fulfillmentsService.createFromOrder(orderId);
  }

  @Put(':id/assign')
  async assign(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.fulfillmentsService.assignToAdmin(id, req.user.id);
  }

  @Put(':id/content')
  async inputContent(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { content: Record<string, any>; notes?: string },
  ) {
    return this.fulfillmentsService.inputDeliveryContent(
      id, req.user.id, body.content, body.notes,
    );
  }

  @Put(':id/deliver')
  async deliver(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.fulfillmentsService.sendDelivery(id, req.user.id);
  }
}
