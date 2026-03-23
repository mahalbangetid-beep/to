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

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true, name: 'ticket_number' })
  ticketNumber: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', nullable: true, name: 'order_id' })
  orderId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string; // 'payment' | 'product' | 'error' | 'other'

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 20, default: 'open' })
  status: string; // 'open' | 'processing' | 'resolved' | 'closed'

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  priority: string; // 'low' | 'medium' | 'high' | 'urgent'

  @Column({ type: 'uuid', nullable: true, name: 'assigned_to' })
  assignedTo: string;

  @Column({ type: 'jsonb', default: '[]' })
  attachments: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
