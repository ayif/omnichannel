import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum StockMovementSource {
  TRANSAKSI = 'transaksi',
  MANUAL = 'manual',
  RESTOCK = 'restock',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'jumlah_perubahan', type: 'int' })
  jumlahPerubahan: number;

  @Column({ type: 'enum', enum: StockMovementSource })
  sumber: StockMovementSource;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
}
