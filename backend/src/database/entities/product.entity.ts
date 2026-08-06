import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductChannelMapping } from './product-channel-mapping.entity';
import { Stock } from './stock.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string;

  @Column({ name: 'nama_produk' })
  namaProduk: string;

  @Column({ nullable: true })
  kategori: string;

  @Column({ name: 'harga_dasar', type: 'numeric', precision: 14, scale: 2 })
  hargaDasar: string;

  @Column({ name: 'stok_minimum', type: 'int', default: 0 })
  stokMinimum: number;

  /** Diisi dari data produk marketplace (Tokopedia/Shopee) pas sync - null sampai integrasi itu jalan. */
  @Column({ name: 'gambar_url', type: 'varchar', nullable: true })
  gambarUrl: string | null;

  @OneToMany(() => ProductChannelMapping, (mapping) => mapping.product)
  channelMappings: ProductChannelMapping[];

  @OneToOne(() => Stock, (stock) => stock.product)
  stock: Stock;
}
