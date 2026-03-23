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
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true, name: 'order_number' })
  @Index()
  orderNumber: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'guest_email' })
  guestEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'guest_phone' })
  guestPhone: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  @Index()
  status: string; // 'pending' | 'paid' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'expired'

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_price' })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'discount_amount' })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'final_price' })
  finalPrice: number;

  @Column({ type: 'uuid', nullable: true, name: 'promo_code_id' })
  promoCodeId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', default: '{}', name: 'customer_data' })
  customerData: Record<string, unknown>;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'paid_at' })
  paidAt: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'completed_at' })
  completedAt: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'expired_at' })
  expiredAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
