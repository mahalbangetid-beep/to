import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_fields')
export class ProductField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'varchar', length: 100, name: 'field_name' })
  fieldName: string; // "email", "user_id", "zone_id", "os"

  @Column({ type: 'varchar', length: 100, name: 'field_label' })
  fieldLabel: string; // "Email Anda", "User ID Game"

  @Column({ type: 'varchar', length: 30, name: 'field_type' })
  fieldType: string; // 'text' | 'email' | 'select' | 'number'

  @Column({ type: 'jsonb', nullable: true })
  options: string[]; // For select: ['Ubuntu', 'CentOS']

  @Column({ type: 'boolean', default: true, name: 'is_required' })
  isRequired: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  placeholder: string;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Product, (product) => product.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
