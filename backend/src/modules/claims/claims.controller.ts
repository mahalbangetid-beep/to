import {
  Controller, Post, Get, Param, Query, Body, UseGuards, Request,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/claim.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('claims')
@UseGuards(JwtAuthGuard)
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateClaimDto) {
    return this.claimsService.create(req.user.id, dto);
  }

  @Get()
  async findByUser(
    @Request() req: any,
    @Query('page') page?: number,
  ) {
    return this.claimsService.findByUser(req.user.id, page || 1);
  }

  @Get('my')
  async findMyClaims(
    @Request() req: any,
    @Query('page') page?: number,
  ) {
    return this.claimsService.findByUser(req.user.id, page || 1);
  }

  @Get(':id')
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.claimsService.findByIdForUser(id, req.user.id);
  }
}
