import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Channel } from '../../common/channel.enum';

/**
 * Kredensial aplikasi (client_id/secret dsb) per channel, satu baris per
 * channel. Ini beda dari ChannelAccount: baris di sini adalah kredensial
 * APLIKASI yang didaftarkan sekali ke marketplace, dipakai buat memulai
 * alur OAuth - bukan token toko yang terhubung. Disimpan sebagai satu blob
 * JSON terenkripsi (format sama seperti access/refresh token toko, lihat
 * common/crypto.util.ts) supaya client secret tidak pernah plain di DB.
 */
@Entity('channel_api_configs')
export class ChannelApiConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Channel, unique: true })
  channel: Channel;

  @Column({ name: 'config_enc', type: 'text' })
  configEnc: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
