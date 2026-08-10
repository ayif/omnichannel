import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AuditAction {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  CHANNEL_CONNECT = 'channel_connect',
  CHANNEL_DISCONNECT = 'channel_disconnect',
  SYNC_TRIGGER = 'sync_trigger',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ name: 'entity_type', type: 'varchar', nullable: true })
  entityType: string | null;

  @Column({ name: 'entity_id', type: 'varchar', nullable: true })
  entityId: string | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ name: 'user_nama', type: 'varchar', nullable: true })
  userNama: string | null;

  @Column({ name: 'user_email', type: 'varchar', nullable: true })
  userEmail: string | null;

  @Column({ type: 'text' })
  description: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
