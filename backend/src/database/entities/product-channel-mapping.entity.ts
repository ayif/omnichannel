import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Channel } from '../../common/channel.enum';
import { Product } from './product.entity';

@Entity('product_channel_mapping')
@Index(['channel', 'channelProductId'], { unique: true })
export class ProductChannelMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.channelMappings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ type: 'enum', enum: Channel })
  channel: Channel;

  @Column({ name: 'channel_product_id' })
  channelProductId: string;

  @Column({ name: 'channel_price', type: 'numeric', precision: 14, scale: 2, nullable: true })
  channelPrice: string;
}
