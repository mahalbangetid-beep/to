import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review)
    private readonly repo: Repository<Review>,
  ) {}

  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    // Check if user already reviewed this product
    const existing = await this.repo.findOne({
      where: { userId, productId: dto.productId },
    });
    if (existing) {
      throw new BadRequestException('Anda sudah memberikan review untuk produk ini');
    }

    const review = new Review();
    review.userId = userId;
    review.productId = dto.productId;
    review.orderId = dto.orderId || (null as any);
    review.rating = dto.rating;
    review.comment = dto.comment || (null as any);
    review.isApproved = false; // needs admin approval
    review.isFeatured = false;

    const saved = await this.repo.save(review);
    this.logger.log(`New review for product ${dto.productId} by user ${userId}`);
    return saved;
  }

  async findByProduct(productId: string, page = 1, limit = 10) {
    const [reviews, total] = await this.repo.findAndCount({
      where: { productId, isApproved: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: r.user ? { id: r.user.id, email: r.user.email } : null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAverageRating(productId: string): Promise<{ avg: number; count: number }> {
    const result = await this.repo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(r.id)', 'count')
      .where('r.product_id = :productId AND r.is_approved = true', { productId })
      .getRawOne();

    return {
      avg: result?.avg ? parseFloat(Number(result.avg).toFixed(1)) : 0,
      count: parseInt(result?.count || '0'),
    };
  }

  // ─── ADMIN ──────────────────────────────────────────

  async findAll(isApproved?: boolean, page = 1, limit = 20) {
    const qb = this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')
      .leftJoinAndSelect('r.product', 'product')
      .orderBy('r.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (isApproved !== undefined) {
      qb.where('r.is_approved = :isApproved', { isApproved });
    }

    const [reviews, total] = await qb.getManyAndCount();

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        isApproved: r.isApproved,
        isFeatured: r.isFeatured,
        createdAt: r.createdAt,
        user: r.user ? { id: r.user.id, email: r.user.email } : null,
        product: r.product ? { id: r.product.id, name: r.product.name } : null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async approve(id: string): Promise<Review> {
    const review = await this.repo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review tidak ditemukan');
    review.isApproved = true;
    return this.repo.save(review);
  }

  async reject(id: string): Promise<void> {
    const review = await this.repo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review tidak ditemukan');
    await this.repo.remove(review);
  }

  async toggleFeatured(id: string): Promise<Review> {
    const review = await this.repo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review tidak ditemukan');
    review.isFeatured = !review.isFeatured;
    return this.repo.save(review);
  }
}
