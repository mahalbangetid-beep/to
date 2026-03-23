import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('claims')
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  @Column({ type: 'uuid', nullable: true, name: 'order_item_id' })
  orderItemId: string;

  @Column({ type: 'varchar', length: 30 })
  type: string; // 'replacement' | 'error' | 'not_received'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: '[]', name: 'proof_urls' })
  proofUrls: string[];

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // 'pending' | 'approved' | 'rejected' | 'completed'

  @Column({ type: 'text', nullable: true, name: 'admin_notes' })
  adminNotes: string;

  @Column({ type: 'uuid', nullable: true, name: 'resolved_by' })
  resolvedBy: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'resolved_at' })
  resolvedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
