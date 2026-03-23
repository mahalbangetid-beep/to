import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim } from './entities/claim.entity';
import { CreateClaimDto } from './dto/claim.dto';

@Injectable()
export class ClaimsService {
  private readonly logger = new Logger(ClaimsService.name);

  constructor(
    @InjectRepository(Claim)
    private readonly repo: Repository<Claim>,
  ) {}

  // ─── USER ACTIONS ───────────────────────────────────

  async create(userId: string, dto: CreateClaimDto): Promise<Claim> {
    // Check duplicate claim for same order
    const existing = await this.repo.findOne({
      where: { userId, orderId: dto.orderId, status: 'pending' },
    });
    if (existing) {
      throw new BadRequestException('Anda sudah memiliki klaim aktif untuk pesanan ini');
    }

    const claim = new Claim();
    claim.userId = userId;
    claim.orderId = dto.orderId;
    claim.orderItemId = dto.orderItemId || (null as any);
    claim.type = dto.type;
    claim.description = dto.description || (null as any);
    claim.proofUrls = dto.proofUrls || [];
    claim.status = 'pending';

    const saved = await this.repo.save(claim);
    this.logger.log(`Claim created for order ${dto.orderId} by user ${userId}`);
    return saved;
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const [claims, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      claims,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByIdForUser(id: string, userId: string): Promise<Claim> {
    const claim = await this.repo.findOne({ where: { id, userId } });
    if (!claim) throw new NotFoundException('Klaim tidak ditemukan');
    return claim;
  }

  // ─── ADMIN ACTIONS ──────────────────────────────────

  async findAll(status?: string, page = 1, limit = 20) {
    const qb = this.repo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'user')
      .orderBy('c.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      qb.andWhere('c.status = :status', { status });
    }

    const [claims, total] = await qb.getManyAndCount();

    return {
      claims: claims.map((c) => ({
        id: c.id,
        orderId: c.orderId,
        type: c.type,
        description: c.description,
        status: c.status,
        adminNotes: c.adminNotes,
        proofUrls: c.proofUrls,
        createdAt: c.createdAt,
        resolvedAt: c.resolvedAt,
        user: c.user ? { id: c.user.id, email: c.user.email } : null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<Claim> {
    const claim = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!claim) throw new NotFoundException('Klaim tidak ditemukan');
    return claim;
  }

  async approve(id: string, adminId: string, notes?: string): Promise<Claim> {
    const claim = await this.findById(id);
    claim.status = 'approved';
    claim.resolvedBy = adminId;
    claim.resolvedAt = new Date();
    claim.adminNotes = notes || (null as any);
    return this.repo.save(claim);
  }

  async reject(id: string, adminId: string, notes?: string): Promise<Claim> {
    const claim = await this.findById(id);
    claim.status = 'rejected';
    claim.resolvedBy = adminId;
    claim.resolvedAt = new Date();
    claim.adminNotes = notes || (null as any);
    return this.repo.save(claim);
  }

  async complete(id: string, adminId: string): Promise<Claim> {
    const claim = await this.findById(id);
    claim.status = 'completed';
    claim.resolvedBy = adminId;
    claim.resolvedAt = new Date();
    return this.repo.save(claim);
  }
}
