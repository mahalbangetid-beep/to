import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductField } from './product-field.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'category_id' })
  @Index()
  categoryId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'short_desc' })
  shortDesc: string;

  @Column({ type: 'varchar', length: 30 })
  @Index()
  type: string; // 'ai_premium' | 'vps' | 'digital_account' | 'jasa_web' | 'game_item' | 'voucher'

  @Column({ type: 'varchar', length: 20, default: 'semi_auto', name: 'fulfillment_type' })
  fulfillmentType: string; // 'auto' | 'semi_auto' | 'manual'

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'base_price' })
  basePrice: number;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  @Index()
  status: string; // 'active' | 'draft' | 'hidden' | 'out_of_stock'

  @Column({ type: 'jsonb', default: '[]' })
  badges: string[]; // ['best_seller', 'instant', 'new', 'limited']

  @Column({ type: 'jsonb', default: '[]' })
  images: string[];

  @Column({ type: 'text', nullable: true })
  rules: string;

  @Column({ type: 'text', nullable: true, name: 'warranty_info' })
  warrantyInfo: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'sla_text' })
  slaText: string;

  @Column({ type: 'jsonb', default: '[]' })
  benefits: string[];

  @Column({ type: 'jsonb', default: '[]', name: 'how_it_works' })
  howItWorks: string[];

  @Column({ type: 'jsonb', default: '[]', name: 'target_audience' })
  targetAudience: string[];

  @Column({ type: 'jsonb', default: '[]' })
  faq: Array<{ question: string; answer: string }>;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'meta_title' })
  metaTitle: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'meta_desc' })
  metaDesc: string;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @Column({ type: 'int', default: 0, name: 'total_sold' })
  totalSold: number;

  @Column({ type: 'boolean', default: false, name: 'is_featured' })
  isFeatured: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Category, (cat) => cat.products, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
  variants: ProductVariant[];

  @OneToMany(() => ProductField, (field) => field.product, { cascade: true })
  fields: ProductField[];
}
