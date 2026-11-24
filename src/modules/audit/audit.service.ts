
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface CreateAuditLogDto {
  userId?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  description?: string | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async log(data: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditRepository.create({
      userId: data.userId ?? null,
      action: data.action,
      entity: data.entity ?? null,
      entityId: data.entityId ?? null,
      description: data.description ?? null,
      metadata: data.metadata ?? null,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
    });

    return this.auditRepository.save(auditLog);
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
