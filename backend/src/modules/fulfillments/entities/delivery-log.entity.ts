import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Fulfillment } from './fulfillment.entity';

@Entity('delivery_logs')
export class DeliveryLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'fulfillment_id' })
  fulfillmentId: string;

  @Column({ type: 'varchar', length: 50 })
  action: string; // 'created' | 'approved' | 'delivered' | 'resent' | 'failed'

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'uuid', nullable: true, name: 'performed_by' })
  performedBy: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Fulfillment)
  @JoinColumn({ name: 'fulfillment_id' })
  fulfillment: Fulfillment;
}
