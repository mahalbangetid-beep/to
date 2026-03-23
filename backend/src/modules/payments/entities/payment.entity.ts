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

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'order_id' })
  @Index()
  orderId: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'external_id' })
  @Index()
  externalId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  method: string; // 'qris' | 'gopay' | 'ovo' | 'bca_va' | etc.

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // 'pending' | 'paid' | 'failed' | 'expired' | 'refunded'

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true, name: 'payment_url' })
  paymentUrl: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'expired_at' })
  expiredAt: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'paid_at' })
  paidAt: Date;

  @Column({ type: 'jsonb', nullable: true, name: 'raw_response' })
  rawResponse: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
