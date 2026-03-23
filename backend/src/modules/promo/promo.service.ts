import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { PromoCode } from './entities/promo-code.entity';
import { CreatePromoDto, ValidatePromoDto } from './dto/promo.dto';

@Injectable()
export class PromoService {
  private readonly logger = new Logger(PromoService.name);

  constructor(
    @InjectRepository(PromoCode)
    private readonly repo: Repository<PromoCode>,
  ) {}

  // ─── ADMIN CRUD ────────────────────────────────────

  async create(dto: CreatePromoDto): Promise<PromoCode> {
    // Check unique code
    const existing = await this.repo.findOne({ where: { code: dto.code.toUpperCase() } });
    if (existing) {
      throw new BadRequestException(`Kode promo "${dto.code}" sudah ada`);
    }

    const promo = new PromoCode();
    promo.code = dto.code.toUpperCase();
    promo.discountType = dto.discountType;
    promo.discountValue = dto.discountValue;
    promo.minPurchase = dto.minPurchase || 0;
    promo.maxDiscount = dto.maxDiscount as any;
    promo.usageLimit = dto.usageLimit as any;
    promo.perUserLimit = dto.perUserLimit || 1;
    promo.applicableProducts = dto.applicableProducts as any;
    promo.startDate = dto.startDate ? new Date(dto.startDate) : (null as any);
    promo.expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : (null as any);
    promo.isActive = dto.isActive !== false;

    return this.repo.save(promo);
  }

  async findAll(): Promise<PromoCode[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<PromoCode> {
    const promo = await this.repo.findOne({ where: { id } });
    if (!promo) throw new NotFoundException('Promo tidak ditemukan');
    return promo;
  }

  async update(id: string, dto: Partial<CreatePromoDto>): Promise<PromoCode> {
    const promo = await this.findById(id);

    if (dto.code) promo.code = dto.code.toUpperCase();
    if (dto.discountType) promo.discountType = dto.discountType;
    if (dto.discountValue !== undefined) promo.discountValue = dto.discountValue;
    if (dto.minPurchase !== undefined) promo.minPurchase = dto.minPurchase;
    if (dto.maxDiscount !== undefined) promo.maxDiscount = dto.maxDiscount as any;
    if (dto.usageLimit !== undefined) promo.usageLimit = dto.usageLimit as any;
    if (dto.perUserLimit !== undefined) promo.perUserLimit = dto.perUserLimit;
    if (dto.applicableProducts !== undefined) promo.applicableProducts = dto.applicableProducts as any;
    if (dto.startDate !== undefined) promo.startDate = dto.startDate ? new Date(dto.startDate) : (null as any);
    if (dto.expiryDate !== undefined) promo.expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : (null as any);
    if (dto.isActive !== undefined) promo.isActive = dto.isActive;

    return this.repo.save(promo);
  }

  async remove(id: string): Promise<void> {
    const promo = await this.findById(id);
    await this.repo.remove(promo);
  }

  async toggleActive(id: string): Promise<PromoCode> {
    const promo = await this.findById(id);
    promo.isActive = !promo.isActive;
    return this.repo.save(promo);
  }

  // ─── VALIDATE & APPLY ──────────────────────────────

  async validate(dto: ValidatePromoDto, userId?: string): Promise<{
    valid: boolean;
    discountAmount: number;
    promoId: string;
    message: string;
  }> {
    const code = dto.code.toUpperCase();

    const promo = await this.repo.findOne({ where: { code } });
    if (!promo) {
      throw new BadRequestException('Kode promo tidak ditemukan');
    }

    // Check active
    if (!promo.isActive) {
      throw new BadRequestException('Kode promo tidak aktif');
    }

    // Check dates
    const now = new Date();
    if (promo.startDate && now < promo.startDate) {
      throw new BadRequestException('Kode promo belum berlaku');
    }
    if (promo.expiryDate && now > promo.expiryDate) {
      throw new BadRequestException('Kode promo sudah kadaluarsa');
    }

    // Check usage limit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      throw new BadRequestException('Kode promo sudah mencapai batas penggunaan');
    }

    // Check min purchase
    if (dto.cartTotal < Number(promo.minPurchase)) {
      throw new BadRequestException(
        `Minimal pembelian Rp ${Number(promo.minPurchase).toLocaleString('id-ID')} untuk menggunakan promo ini`,
      );
    }

    // Check applicable products
    if (promo.applicableProducts && promo.applicableProducts.length > 0 && dto.productIds) {
      const hasMatch = dto.productIds.some((id) => promo.applicableProducts.includes(id));
      if (!hasMatch) {
        throw new BadRequestException('Kode promo tidak berlaku untuk produk ini');
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = dto.cartTotal * (Number(promo.discountValue) / 100);
      if (promo.maxDiscount && discountAmount > Number(promo.maxDiscount)) {
        discountAmount = Number(promo.maxDiscount);
      }
    } else {
      // fixed
      discountAmount = Number(promo.discountValue);
    }

    // Don't let discount exceed cart total
    discountAmount = Math.min(discountAmount, dto.cartTotal);
    discountAmount = Math.round(discountAmount);

    this.logger.log(`Promo ${code} validated: discount Rp ${discountAmount}`);

    return {
      valid: true,
      discountAmount,
      promoId: promo.id,
      message: `Diskon Rp ${discountAmount.toLocaleString('id-ID')} diterapkan!`,
    };
  }

  async incrementUsage(promoId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(PromoCode)
      .set({ usedCount: () => 'used_count + 1' })
      .where('id = :id', { id: promoId })
      .execute();
  }
}
