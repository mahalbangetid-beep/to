import {
  Injectable, ConflictException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly repo: Repository<Wishlist>,
  ) {}

  async add(userId: string, productId: string): Promise<Wishlist> {
    const existing = await this.repo.findOne({ where: { userId, productId } });
    if (existing) {
      throw new ConflictException('Produk sudah ada di wishlist');
    }

    const item = new Wishlist();
    item.userId = userId;
    item.productId = productId;
    return this.repo.save(item);
  }

  async remove(userId: string, productId: string): Promise<void> {
    const item = await this.repo.findOne({ where: { userId, productId } });
    if (!item) throw new NotFoundException('Item tidak ada di wishlist');
    await this.repo.remove(item);
  }

  async findByUser(userId: string) {
    const items = await this.repo.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });

    return {
      items: items.map((w) => ({
        id: w.id,
        productId: w.productId,
        createdAt: w.createdAt,
        product: w.product
          ? {
              id: w.product.id,
              name: w.product.name,
              slug: w.product.slug,
              basePrice: w.product.basePrice,
              imageUrl: w.product.images?.[0] || null,
              shortDesc: w.product.shortDesc,
            }
          : null,
      })),
      total: items.length,
    };
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { userId, productId } });
    return count > 0;
  }

  async toggle(userId: string, productId: string): Promise<{ added: boolean }> {
    const existing = await this.repo.findOne({ where: { userId, productId } });
    if (existing) {
      await this.repo.remove(existing);
      return { added: false };
    }

    const item = new Wishlist();
    item.userId = userId;
    item.productId = productId;
    await this.repo.save(item);
    return { added: true };
  }
}
