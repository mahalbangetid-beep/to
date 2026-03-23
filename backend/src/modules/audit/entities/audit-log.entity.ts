import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  action: string; // 'order.created' | 'payment.confirmed' | 'product.updated'

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'entity_type' })
  @Index()
  entityType: string; // 'order' | 'product' | 'user'

  @Column({ type: 'uuid', nullable: true, name: 'entity_id' })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true, name: 'old_data' })
  oldData: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true, name: 'new_data' })
  newData: Record<string, unknown>;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
