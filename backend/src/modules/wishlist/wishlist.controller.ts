import {
  Controller, Post, Delete, Get, Param, UseGuards, Request,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(@Request() req: any) {
    return this.wishlistService.findByUser(req.user.id);
  }

  @Post(':productId/toggle')
  async toggle(
    @Request() req: any,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.toggle(req.user.id, productId);
  }

  @Post(':productId')
  async add(
    @Request() req: any,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.add(req.user.id, productId);
  }

  @Delete(':productId')
  async remove(
    @Request() req: any,
    @Param('productId') productId: string,
  ) {
    await this.wishlistService.remove(req.user.id, productId);
    return { message: 'Berhasil dihapus dari wishlist' };
  }

  @Get(':productId/check')
  async check(
    @Request() req: any,
    @Param('productId') productId: string,
  ) {
    const inWishlist = await this.wishlistService.isInWishlist(req.user.id, productId);
    return { inWishlist };
  }
}
