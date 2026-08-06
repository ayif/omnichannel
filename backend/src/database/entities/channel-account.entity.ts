import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Channel } from '../../common/channel.enum';

export enum ChannelAccountStatus {
  CONNECTED = 'connected',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

/**
 * Satu baris = satu toko yang terhubung di satu channel. Sengaja tidak
 * unique per channel supaya satu channel bisa punya lebih dari satu toko
 * (multi-toko). accessToken/refreshToken disimpan terenkripsi
 * (lihat common/crypto.util.ts) - jangan pernah query/return kolom ini
 * ke frontend dalam bentuk plain.
 */
@Entity('channel_accounts')
@Index(['channel', 'shopId'], { unique: true })
export class ChannelAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Channel })
  channel: Channel;

  @Column({ name: 'shop_id' })
  shopId: string;

  @Column({ name: 'nama_toko' })
  namaToko: string;

  @Column({ name: 'access_token_enc', type: 'text' })
  accessTokenEnc: string;

  @Column({ name: 'refresh_token_enc', type: 'text', nullable: true })
  refreshTokenEnc: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'enum', enum: ChannelAccountStatus, default: ChannelAccountStatus.CONNECTED })
  status: ChannelAccountStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
