import {
  Controller, Post, Get, Param, Query, Body, UseGuards, Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, dto);
  }

  @Get('product/:productId')
  async getByProduct(
    @Param('productId') productId: string,
    @Query('page') page?: number,
  ) {
    return this.reviewsService.findByProduct(productId, page || 1);
  }

  @Get('product/:productId/rating')
  async getRating(@Param('productId') productId: string) {
    return this.reviewsService.getAverageRating(productId);
  }
}
