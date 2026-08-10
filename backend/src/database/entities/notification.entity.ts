import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum NotificationType {
  STOCK_LOW = 'stock_low',
  SYNC_FAILED = 'sync_failed',
}

export enum NotificationSeverity {
  WARNING = 'warning',
  CRITICAL = 'critical',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'enum', enum: NotificationSeverity })
  severity: NotificationSeverity;

  @Column({ name: 'entity_type' })
  entityType: string;

  @Column({ name: 'entity_id' })
  entityId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
