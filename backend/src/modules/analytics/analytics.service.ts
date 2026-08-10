import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Channel } from '../../common/channel.enum';
import { REVENUE_STATUSES } from '../../common/transaction-status.util';
import { Product } from '../../database/entities/product.entity';
import { StockMovement, StockMovementSource } from '../../database/entities/stock-movement.entity';
import { Transaction } from '../../database/entities/transaction.entity';

const DEFAULT_LIMIT = 10;
const DEFAULT_LOOKBACK_DAYS = 30;

interface RevenueQueryParams {
  channel?: Channel;
  startDate?: string;
  endDate?: string;
}

export interface ChannelQtyDto {
  channel: Channel;
  qty: number;
}

export interface ProdukTerlarisDto {
  productId: string;
  namaProduk: string;
  qtyTerjual: number;
  omzet: number;
  perChannel: ChannelQtyDto[];
}

export interface StokTercepatHabisDto {
  productId: string;
  namaProduk: string;
  stokSaatIni: number;
  avgPerHari: number;
  perkiraanHariTersisa: number | null;
  perChannel: ChannelQtyDto[];
}

function clampLookbackDays(value?: number): number {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LOOKBACK_DAYS;
  return Math.min(365, n);
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(StockMovement) private readonly stockMovementRepo: Repository<StockMovement>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
  ) {}

  private buildRevenueQuery(params: RevenueQueryParams) {
    const qb = this.transactionRepo
      .createQueryBuilder('t')
      .innerJoin('t.product', 'product')
      .where('t.status IN (:...statuses)', { statuses: REVENUE_STATUSES });

    if (params.channel) {
      qb.andWhere('t.channel = :channel', { channel: params.channel });
    }
    if (params.startDate) {
      qb.andWhere('t.tanggal_transaksi >= :startDate', { startDate: new Date(params.startDate) });
    }
    if (params.endDate) {
      const endOfDay = new Date(params.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      qb.andWhere('t.tanggal_transaksi <= :endDate', { endDate: endOfDay });
    }

    return qb;
  }

  private async channelBreakdown(
    params: RevenueQueryParams,
    productIds: string[],
  ): Promise<Map<string, ChannelQtyDto[]>> {
    const map = new Map<string, ChannelQtyDto[]>();
    if (productIds.length === 0) return map;

    const rows = await this.buildRevenueQuery(params)
      .andWhere('product.id IN (:...productIds)', { productIds })
      .select('product.id', 'productId')
      .addSelect('t.channel', 'channel')
      .addSelect('SUM(t.qty)', 'qty')
      .groupBy('product.id')
      .addGroupBy('t.channel')
      .getRawMany();

    for (const row of rows) {
      const arr = map.get(row.productId) ?? [];
      arr.push({ channel: row.channel, qty: Number(row.qty) });
      map.set(row.productId, arr);
    }
    return map;
  }

  async produkTerlaris(params: RevenueQueryParams & { limit?: number }): Promise<ProdukTerlarisDto[]> {
    const limit = params.limit ?? DEFAULT_LIMIT;

    const rows = await this.buildRevenueQuery(params)
      .select('product.id', 'productId')
      .addSelect('product.nama_produk', 'namaProduk')
      .addSelect('SUM(t.qty)', 'qtyTerjual')
      .addSelect('SUM(t.harga_jual * t.qty)', 'omzet')
      .groupBy('product.id')
      .addGroupBy('product.nama_produk')
      .getRawMany();

    const top = rows
      .map((row) => ({
        productId: row.productId,
        namaProduk: row.namaProduk,
        qtyTerjual: Number(row.qtyTerjual),
        omzet: Number(row.omzet),
      }))
      .sort((a, b) => b.qtyTerjual - a.qtyTerjual)
      .slice(0, limit);

    const perChannelMap = await this.channelBreakdown(
      params,
      top.map((p) => p.productId),
    );

    return top.map((p) => ({ ...p, perChannel: perChannelMap.get(p.productId) ?? [] }));
  }

  async stokTercepatHabis(params: { lookbackDays?: number; limit?: number }): Promise<StokTercepatHabisDto[]> {
    const lookbackDays = clampLookbackDays(params.lookbackDays);
    const limit = params.limit ?? DEFAULT_LIMIT;

    const velocityRows = await this.stockMovementRepo
      .createQueryBuilder('sm')
      .where('sm.sumber = :sumber', { sumber: StockMovementSource.TRANSAKSI })
      .andWhere('sm.jumlah_perubahan < 0')
      .andWhere(`sm.timestamp >= now() - interval '${lookbackDays} days'`)
      .select('sm.product_id', 'productId')
      .addSelect('SUM(-sm.jumlah_perubahan)', 'qtyTerjual')
      .groupBy('sm.product_id')
      .getRawMany();

    if (velocityRows.length === 0) return [];

    const productIds = velocityRows.map((row) => row.productId);
    const products = await this.productRepo.find({
      where: { id: In(productIds) },
      relations: { stock: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const withVelocity = velocityRows.map((row) => {
      const product = productMap.get(row.productId);
      const qtyTerjual = Number(row.qtyTerjual);
      const avgPerHari = qtyTerjual / lookbackDays;
      const stokSaatIni = product?.stock?.jumlahStok ?? 0;
      const perkiraanHariTersisa = avgPerHari > 0 ? stokSaatIni / avgPerHari : null;

      return {
        productId: row.productId as string,
        namaProduk: product?.namaProduk ?? '',
        stokSaatIni,
        avgPerHari,
        perkiraanHariTersisa,
      };
    });

    const sorted = withVelocity
      .sort((a, b) => {
        if (a.perkiraanHariTersisa === null) return 1;
        if (b.perkiraanHariTersisa === null) return -1;
        return a.perkiraanHariTersisa - b.perkiraanHariTersisa;
      })
      .slice(0, limit);

    const perChannelMap = await this.channelBreakdown(
      { startDate: daysAgoIso(lookbackDays) },
      sorted.map((p) => p.productId),
    );

    return sorted.map((p) => ({ ...p, perChannel: perChannelMap.get(p.productId) ?? [] }));
  }
}
