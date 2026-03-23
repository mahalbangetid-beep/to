import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PromoService } from './promo.service';
import { ValidatePromoDto } from './dto/promo.dto';

@Controller('promo')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Post('validate')
  async validate(@Body() dto: ValidatePromoDto) {
    return this.promoService.validate(dto);
  }
}
