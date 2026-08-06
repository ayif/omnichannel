import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Channel } from '../../common/channel.enum';

export enum SyncStatus {
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('sync_logs')
export class SyncLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Channel })
  channel: Channel;

  @Column({ type: 'enum', enum: SyncStatus, default: SyncStatus.RUNNING })
  status: SyncStatus;

  @Column({ name: 'waktu_mulai', type: 'timestamptz' })
  waktuMulai: Date;

  @Column({ name: 'waktu_selesai', type: 'timestamptz', nullable: true })
  waktuSelesai: Date;

  @Column({ name: 'jumlah_data_ditarik', type: 'int', default: 0 })
  jumlahDataDitarik: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;
}
