import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Channel } from '../../common/channel.enum';
import { Product } from './product.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUND = 'refund',
}

@Entity('transactions')
@Index(['channel', 'channelOrderId'], { unique: true })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Channel })
  channel: Channel;

  @Column({ name: 'channel_order_id' })
  channelOrderId: string;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ type: 'int' })
  qty: number;

  @Column({ name: 'harga_jual', type: 'numeric', precision: 14, scale: 2 })
  hargaJual: string;

  @Column({ name: 'ongkos_kirim', type: 'numeric', precision: 14, scale: 2, default: 0 })
  ongkosKirim: string;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ name: 'tanggal_transaksi', type: 'timestamptz' })
  tanggalTransaksi: Date;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Column({ name: 'raw_payload', type: 'jsonb', nullable: true })
  rawPayload: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
