import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('fulfillments')
export class Fulfillment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'order_id' })
  @Index()
  orderId: string;

  @Column({ type: 'uuid', nullable: true, name: 'order_item_id' })
  orderItemId: string;

  @Column({ type: 'varchar', length: 20 })
  type: string; // 'auto' | 'semi_auto' | 'manual'

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // 'pending' | 'processing' | 'completed' | 'failed'

  @Column({ type: 'jsonb', nullable: true, name: 'delivery_content' })
  deliveryContent: Record<string, unknown>; // {"email": "x@y.com", "password": "***"}

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'delivery_channel' })
  deliveryChannel: string; // 'dashboard' | 'email' | 'whatsapp'

  @Column({ type: 'uuid', nullable: true, name: 'processed_by' })
  processedBy: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'processed_at' })
  processedAt: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'completed_at' })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
