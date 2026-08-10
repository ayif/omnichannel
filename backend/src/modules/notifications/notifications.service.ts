import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationSeverity,
  NotificationType,
} from '../../database/entities/notification.entity';

export interface NotifyParams {
  type: NotificationType;
  severity: NotificationSeverity;
  entityType: string;
  entityId: string;
  title: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

export interface NotificationDto {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  entityType: string;
  entityId: string;
  title: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  isRead: boolean;
  createdAt: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async notifyIfAbsent(params: NotifyParams): Promise<void> {
    const existing = await this.notificationRepo.exists({
      where: { type: params.type, entityId: params.entityId, isRead: false },
    });
    if (existing) return;

    await this.notificationRepo.save(
      this.notificationRepo.create({
        type: params.type,
        severity: params.severity,
        entityType: params.entityType,
        entityId: params.entityId,
        title: params.title,
        message: params.message,
        metadata: params.metadata ?? null,
      }),
    );
  }

  async resolve(type: NotificationType, entityId: string): Promise<void> {
    await this.notificationRepo.update({ type, entityId, isRead: false }, { isRead: true });
  }

  async findAll(params: { unreadOnly?: boolean }): Promise<NotificationDto[]> {
    const rows = await this.notificationRepo.find({
      where: params.unreadOnly ? { isRead: false } : {},
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      severity: row.severity,
      entityType: row.entityType,
      entityId: row.entityId,
      title: row.title,
      message: row.message,
      metadata: row.metadata,
      isRead: row.isRead,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async markRead(id: string): Promise<void> {
    await this.notificationRepo.update(id, { isRead: true });
  }

  async markAllRead(): Promise<void> {
    await this.notificationRepo.update({ isRead: false }, { isRead: true });
  }
}
