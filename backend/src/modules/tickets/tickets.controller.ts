import {
  Controller, Post, Get, Param, Query, Body, UseGuards, Request,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateTicketDto) {
    return this.ticketsService.create(req.user.id, dto);
  }

  @Get()
  async findByUser(
    @Request() req: any,
    @Query('page') page?: number,
  ) {
    return this.ticketsService.findByUser(req.user.id, page || 1);
  }

  @Get(':id')
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.ticketsService.findByIdForUser(id, req.user.id);
  }
}
