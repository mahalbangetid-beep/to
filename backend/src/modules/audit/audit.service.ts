import {
  Injectable, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface AuditLogInput {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async log(input: AuditLogInput): Promise<AuditLog> {
    const entry = new AuditLog();
    entry.userId = input.userId || (null as any);
    entry.action = input.action;
    entry.entityType = input.entityType || (null as any);
    entry.entityId = input.entityId || (null as any);
    entry.oldData = input.oldData || (null as any);
    entry.newData = input.newData || (null as any);
    entry.ipAddress = input.ipAddress || (null as any);

    const saved = await this.repo.save(entry);
    this.logger.debug(`Audit: ${input.action} on ${input.entityType}:${input.entityId} by ${input.userId || 'system'}`);
    return saved;
  }

  async findAll(
    filters: { entityType?: string; action?: string; userId?: string },
    page = 1,
    limit = 50,
  ) {
    const qb = this.repo
      .createQueryBuilder('a')
      .orderBy('a.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.entityType) {
      qb.andWhere('a.entity_type = :et', { et: filters.entityType });
    }
    if (filters.action) {
      qb.andWhere('a.action LIKE :action', { action: `%${filters.action}%` });
    }
    if (filters.userId) {
      qb.andWhere('a.user_id = :userId', { userId: filters.userId });
    }

    const [logs, total] = await qb.getManyAndCount();

    return {
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.repo.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
