import {
  Injectable, NotFoundException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/ticket.dto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectRepository(Ticket)
    private readonly repo: Repository<Ticket>,
  ) {}

  // ─── USER ACTIONS ───────────────────────────────────

  async create(userId: string, dto: CreateTicketDto): Promise<Ticket> {
    const ticket = new Ticket();
    ticket.ticketNumber = this.generateTicketNumber();
    ticket.userId = userId;
    ticket.orderId = dto.orderId || (null as any);
    ticket.category = dto.category || (null as any);
    ticket.subject = dto.subject;
    ticket.message = dto.message;
    ticket.status = 'open';
    ticket.priority = 'medium';
    ticket.attachments = dto.attachments || [];

    const saved = await this.repo.save(ticket);
    this.logger.log(`Ticket ${saved.ticketNumber} created by user ${userId}`);
    return saved;
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const [tickets, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      tickets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<Ticket> {
    const ticket = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!ticket) throw new NotFoundException('Tiket tidak ditemukan');
    return ticket;
  }

  async findByIdForUser(id: string, userId: string): Promise<Ticket> {
    const ticket = await this.repo.findOne({
      where: { id, userId },
    });
    if (!ticket) throw new NotFoundException('Tiket tidak ditemukan');
    return ticket;
  }

  // ─── ADMIN ACTIONS ──────────────────────────────────

  async findAll(status?: string, priority?: string, page = 1, limit = 20) {
    const qb = this.repo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.user', 'user')
      .orderBy('t.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      qb.andWhere('t.status = :status', { status });
    }
    if (priority) {
      qb.andWhere('t.priority = :priority', { priority });
    }

    const [tickets, total] = await qb.getManyAndCount();

    return {
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        category: t.category,
        status: t.status,
        priority: t.priority,
        assignedTo: t.assignedTo,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        user: t.user ? { id: t.user.id, email: t.user.email } : null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateStatus(id: string, status: string): Promise<Ticket> {
    const ticket = await this.findById(id);
    ticket.status = status;
    return this.repo.save(ticket);
  }

  async assign(id: string, adminId: string): Promise<Ticket> {
    const ticket = await this.findById(id);
    ticket.assignedTo = adminId;
    ticket.status = 'processing';
    return this.repo.save(ticket);
  }

  async updatePriority(id: string, priority: string): Promise<Ticket> {
    const ticket = await this.findById(id);
    ticket.priority = priority;
    return this.repo.save(ticket);
  }

  // ─── HELPERS ────────────────────────────────────────

  private generateTicketNumber(): string {
    const now = new Date();
    const date = now.toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TK-${date}-${rand}`;
  }
}
