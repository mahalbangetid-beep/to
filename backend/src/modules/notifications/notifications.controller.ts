import {
  Controller, Get, Put, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  async getNotifications(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.findByUser(
      req.user.id, page || 1, limit || 20,
    );
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    await this.notificationsService.markAsRead(id, req.user.id);
    return { message: 'Notifikasi ditandai sudah dibaca' };
  }

  @Put('read-all')
  async markAllAsRead(@Request() req: any) {
    const count = await this.notificationsService.markAllAsRead(req.user.id);
    return { message: `${count} notifikasi ditandai sudah dibaca` };
  }
}
