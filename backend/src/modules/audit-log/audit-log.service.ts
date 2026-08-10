import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditAction, AuditLog } from '../../database/entities/audit-log.entity';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

export interface RecordAuditParams {
  action: AuditAction;
  description: string;
  entityType?: string;
  entityId?: string;
  user?: AuthenticatedUser | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
  ipAddress?: string;
}

export interface AuditLogDto {
  id: string;
  action: AuditAction;
  entityType: string | null;
  entityId: string | null;
  userNama: string | null;
  userEmail: string | null;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  ipAddress: string | null;
  createdAt: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog) private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async record(params: RecordAuditParams): Promise<void> {
    const entry = this.auditLogRepo.create({
      action: params.action,
      description: params.description,
      entityType: params.entityType ?? null,
      entityId: params.entityId ?? null,
      userId: params.user?.sub ?? null,
      userNama: params.user?.nama ?? null,
      userEmail: params.user?.email ?? null,
      metadata: params.metadata ?? null,
      ipAddress: params.ipAddress ?? null,
    });
    await this.auditLogRepo.save(entry);
  }

  async findAll(params: {
    action?: AuditAction;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditLogDto[]> {
    const qb = this.auditLogRepo.createQueryBuilder('a').orderBy('a.created_at', 'DESC');

    if (params.action) {
      qb.andWhere('a.action = :action', { action: params.action });
    }
    if (params.startDate) {
      qb.andWhere('a.created_at >= :startDate', { startDate: new Date(params.startDate) });
    }
    if (params.endDate) {
      const endOfDay = new Date(params.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      qb.andWhere('a.created_at <= :endDate', { endDate: endOfDay });
    }
    qb.take(params.limit ?? 200);

    const rows = await qb.getMany();
    return rows.map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      userNama: row.userNama,
      userEmail: row.userEmail,
      description: row.description,
      metadata: row.metadata,
      ipAddress: row.ipAddress,
      createdAt: row.createdAt.toISOString(),
    }));
  }
}
