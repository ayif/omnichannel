import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Channel } from '../common/channel.enum';
import { Role } from '../common/role.enum';
import {
  Product,
  ProductChannelMapping,
  Stock,
  StockMovement,
  SyncLog,
  Transaction,
  User,
} from './entities';
import { SyncStatus } from './entities/sync-log.entity';
import { TransactionStatus } from './entities/transaction.entity';

const DEFAULT_USERS = [
  { email: 'admin@rekap.local', password: 'admin123', nama: 'Admin', role: Role.ADMIN },
  { email: 'staf@rekap.local', password: 'staf12345', nama: 'Staf Penjualan', role: Role.STAFF },
  { email: 'gudang@rekap.local', password: 'gudang123', nama: 'Staf Gudang', role: Role.GUDANG },
] as const;

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 3_600_000);
}

function minutesAgo(m: number): Date {
  return new Date(Date.now() - m * 60_000);
}

const PRODUCTS = [
  { sku: 'ELK-001', namaProduk: 'Earphone Bluetooth X1', kategori: 'Elektronik', hargaDasar: 89000, jumlahStok: 142, stokMinimum: 20 },
  { sku: 'ELK-002', namaProduk: 'Power Bank 10000mAh', kategori: 'Elektronik', hargaDasar: 125000, jumlahStok: 8, stokMinimum: 15 },
  { sku: 'FSH-001', namaProduk: 'Kaos Polos Combed 30s', kategori: 'Fashion', hargaDasar: 45000, jumlahStok: 310, stokMinimum: 50 },
  { sku: 'FSH-002', namaProduk: 'Celana Chino Slimfit', kategori: 'Fashion', hargaDasar: 165000, jumlahStok: 4, stokMinimum: 10 },
  { sku: 'RMH-001', namaProduk: 'Rak Serbaguna 3 Susun', kategori: 'Rumah Tangga', hargaDasar: 210000, jumlahStok: 56, stokMinimum: 10 },
  { sku: 'RMH-002', namaProduk: 'Toples Kedap Udara Set', kategori: 'Rumah Tangga', hargaDasar: 78000, jumlahStok: 97, stokMinimum: 20 },
  { sku: 'KEC-001', namaProduk: 'Serum Wajah Niacinamide', kategori: 'Kecantikan', hargaDasar: 58000, jumlahStok: 12, stokMinimum: 25 },
  { sku: 'KEC-002', namaProduk: 'Sunscreen SPF50 50ml', kategori: 'Kecantikan', hargaDasar: 72000, jumlahStok: 203, stokMinimum: 30 },
] as const;

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [Product, ProductChannelMapping, Stock, StockMovement, SyncLog, Transaction, User],
    synchronize: true,
  });
  await dataSource.initialize();

  await dataSource.transaction(async (manager) => {
    for (const entity of [Transaction, StockMovement, ProductChannelMapping, Stock, SyncLog, Product, User]) {
      await manager.createQueryBuilder().delete().from(entity).execute();
    }

    for (const u of DEFAULT_USERS) {
      await manager.save(
        manager.create(User, {
          email: u.email,
          passwordHash: await bcrypt.hash(u.password, 10),
          nama: u.nama,
          role: u.role,
        }),
      );
    }

    const products: Record<string, Product> = {};
    for (const p of PRODUCTS) {
      const saved = await manager.save(
        manager.create(Product, {
          sku: p.sku,
          namaProduk: p.namaProduk,
          kategori: p.kategori,
          hargaDasar: String(p.hargaDasar),
          stokMinimum: p.stokMinimum,
        }),
      );
      products[p.sku] = saved;

      await manager.save(
        manager.create(Stock, { productId: saved.id, jumlahStok: p.jumlahStok }),
      );

      for (const channel of Object.values(Channel)) {
        await manager.save(
          manager.create(ProductChannelMapping, {
            productId: saved.id,
            channel,
            channelProductId: `${p.sku}-${channel.slice(0, 3).toUpperCase()}`,
            channelPrice: String(p.hargaDasar),
          }),
        );
      }
    }

    const transactions: Array<{
      channel: Channel;
      channelOrderId: string;
      sku: string;
      qty: number;
      hargaJual: number;
      ongkosKirim: number;
      status: TransactionStatus;
      tanggalTransaksi: Date;
    }> = [
      { channel: Channel.TOKOPEDIA, channelOrderId: 'TKP-88213', sku: 'ELK-001', qty: 2, hargaJual: 89000, ongkosKirim: 12000, status: TransactionStatus.COMPLETED, tanggalTransaksi: hoursAgo(2) },
      { channel: Channel.SHOPEE, channelOrderId: 'SHP-33210', sku: 'FSH-001', qty: 5, hargaJual: 45000, ongkosKirim: 9000, status: TransactionStatus.SHIPPED, tanggalTransaksi: hoursAgo(3) },
      { channel: Channel.WEBSITE, channelOrderId: 'WEB-1042', sku: 'RMH-001', qty: 1, hargaJual: 210000, ongkosKirim: 18000, status: TransactionStatus.PAID, tanggalTransaksi: hoursAgo(5) },
      { channel: Channel.TOKOPEDIA, channelOrderId: 'TKP-88190', sku: 'KEC-002', qty: 3, hargaJual: 72000, ongkosKirim: 10000, status: TransactionStatus.PENDING, tanggalTransaksi: hoursAgo(6) },
      { channel: Channel.SHOPEE, channelOrderId: 'SHP-33188', sku: 'ELK-002', qty: 1, hargaJual: 125000, ongkosKirim: 0, status: TransactionStatus.CANCELLED, tanggalTransaksi: hoursAgo(9) },
      { channel: Channel.TOKOPEDIA, channelOrderId: 'TKP-88142', sku: 'FSH-002', qty: 2, hargaJual: 165000, ongkosKirim: 15000, status: TransactionStatus.COMPLETED, tanggalTransaksi: hoursAgo(13) },
      { channel: Channel.WEBSITE, channelOrderId: 'WEB-1038', sku: 'RMH-002', qty: 4, hargaJual: 78000, ongkosKirim: 12000, status: TransactionStatus.REFUND, tanggalTransaksi: hoursAgo(20) },
      { channel: Channel.SHOPEE, channelOrderId: 'SHP-33150', sku: 'KEC-001', qty: 6, hargaJual: 58000, ongkosKirim: 9000, status: TransactionStatus.COMPLETED, tanggalTransaksi: hoursAgo(27) },
    ];

    // Sebaran 14 hari terakhir (hari ke-13 s.d ke-1; "hari ini" sudah
    // terwakili transaksi "terbaru" di atas) supaya chart tren penjualan
    // dashboard menampilkan pola & besaran berbeda per channel, bukan
    // angka yang sama persis (kalau sama, garis Tokopedia akan tertutup
    // sempurna oleh garis Shopee di area chart).
    const trendByDay: Record<Channel, number[]> = {
      [Channel.TOKOPEDIA]: [1240000, 1310000, 1180000, 1420000, 1050000, 1680000, 1890000, 1260000, 1390000, 1510000, 1330000, 1740000, 1960000],
      [Channel.SHOPEE]: [780000, 690000, 810000, 900000, 760000, 1020000, 1140000, 820000, 870000, 960000, 890000, 1080000, 1210000],
      [Channel.WEBSITE]: [320000, 340000, 300000, 360000, 280000, 410000, 460000, 330000, 350000, 390000, 370000, 420000, 480000],
      [Channel.TIKTOKSHOP]: [180000, 210000, 240000, 260000, 230000, 340000, 420000, 290000, 360000, 410000, 380000, 520000, 610000],
    };
    const trendSkus = ['ELK-001', 'FSH-001', 'RMH-002', 'KEC-002', 'ELK-002'];
    let seq = 90000;
    for (let day = 13; day >= 1; day--) {
      const idx = 13 - day;
      for (const channel of Object.values(Channel)) {
        const sku = trendSkus[(day + channel.length) % trendSkus.length];
        transactions.push({
          channel,
          channelOrderId: `${channel.slice(0, 3).toUpperCase()}-${seq++}`,
          sku,
          qty: 1,
          hargaJual: trendByDay[channel][idx],
          ongkosKirim: 9000,
          status: TransactionStatus.COMPLETED,
          tanggalTransaksi: hoursAgo(day * 24 + 6),
        });
      }
    }

    for (const t of transactions) {
      await manager.save(
        manager.create(Transaction, {
          channel: t.channel,
          channelOrderId: t.channelOrderId,
          productId: products[t.sku].id,
          qty: t.qty,
          hargaJual: String(t.hargaJual),
          ongkosKirim: String(t.ongkosKirim),
          status: t.status,
          tanggalTransaksi: t.tanggalTransaksi,
        }),
      );
    }

    await manager.save(
      manager.create(SyncLog, {
        channel: Channel.TOKOPEDIA,
        status: SyncStatus.SUCCESS,
        waktuMulai: minutesAgo(6),
        waktuSelesai: minutesAgo(5),
        jumlahDataDitarik: 14,
      }),
    );
    await manager.save(
      manager.create(SyncLog, {
        channel: Channel.SHOPEE,
        status: SyncStatus.SUCCESS,
        waktuMulai: minutesAgo(8),
        waktuSelesai: minutesAgo(7),
        jumlahDataDitarik: 9,
      }),
    );
    await manager.save(
      manager.create(SyncLog, {
        channel: Channel.WEBSITE,
        status: SyncStatus.FAILED,
        waktuMulai: minutesAgo(15),
        waktuSelesai: minutesAgo(15),
        jumlahDataDitarik: 0,
        errorMessage: 'Webhook timeout setelah 30s',
      }),
    );
  });

  await dataSource.destroy();
  console.log('Seed selesai. Login dengan salah satu akun berikut:');
  for (const u of DEFAULT_USERS) {
    console.log(`  - ${u.email} / ${u.password} (${u.role})`);
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
