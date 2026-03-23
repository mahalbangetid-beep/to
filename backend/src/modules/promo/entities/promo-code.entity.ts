import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('promo_codes')
export class PromoCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 20, name: 'discount_type' })
  discountType: string; // 'percentage' | 'fixed'

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'discount_value' })
  discountValue: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'min_purchase' })
  minPurchase: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, name: 'max_discount' })
  maxDiscount: number;

  @Column({ type: 'int', nullable: true, name: 'usage_limit' })
  usageLimit: number;

  @Column({ type: 'int', default: 0, name: 'used_count' })
  usedCount: number;

  @Column({ type: 'int', default: 1, name: 'per_user_limit' })
  perUserLimit: number;

  @Column({ type: 'jsonb', nullable: true, name: 'applicable_products' })
  applicableProducts: string[];

  @Column({ type: 'timestamptz', nullable: true, name: 'start_date' })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'expiry_date' })
  expiryDate: Date;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
