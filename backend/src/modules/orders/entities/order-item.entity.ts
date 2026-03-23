import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'uuid', nullable: true, name: 'variant_id' })
  variantId: string;

  @Column({ type: 'varchar', length: 255, name: 'product_name' })
  productName: string; // Snapshot

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'variant_name' })
  variantName: string; // Snapshot

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number; // Snapshot

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'jsonb', default: '{}', name: 'field_values' })
  fieldValues: Record<string, string>; // {"email": "user@example.com"}

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
