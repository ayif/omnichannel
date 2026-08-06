import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../../common/channel.enum';
import { Stock } from '../../database/entities/stock.entity';
import { SyncLog, SyncStatus } from '../../database/entities/sync-log.entity';
import { Transaction } from '../../database/entities/transaction.entity';

const TREND_DAYS = 14;

export interface DailyChannelRevenueDto {
  date: string;
  tokopedia: number;
  shopee: number;
  website: number;
  tiktokshop: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Stock) private readonly stockRepo: Repository<Stock>,
    @InjectRepository(SyncLog) private readonly syncLogRepo: Repository<SyncLog>,
  ) {}

  private async revenueByDayAndChannel(): Promise<{ day: string; channel: Channel; total: string }[]> {
    return this.transactionRepo
      .createQueryBuilder('t')
      .select("to_char(date_trunc('day', t.tanggal_transaksi), 'YYYY-MM-DD')", 'day')
      .addSelect('t.channel', 'channel')
      .addSelect('SUM(t.harga_jual * t.qty + t.ongkos_kirim)', 'total')
      .where(`t.tanggal_transaksi >= now() - interval '${TREND_DAYS} days'`)
      .groupBy("date_trunc('day', t.tanggal_transaksi)")
      .addGroupBy('t.channel')
      .orderBy("date_trunc('day', t.tanggal_transaksi)", 'ASC')
      .getRawMany();
  }

  async salesTrend(): Promise<DailyChannelRevenueDto[]> {
    const rows = await this.revenueByDayAndChannel();
    const byDay = new Map<string, DailyChannelRevenueDto>();

    for (let i = TREND_DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, { date: key, tokopedia: 0, shopee: 0, website: 0, tiktokshop: 0 });
    }

    for (const row of rows) {
      const entry = byDay.get(row.day);
      if (!entry) continue;
      entry[row.channel as Channel] = Number(row.total);
    }

    return Array.from(byDay.values());
  }

  async channelTotals(): Promise<{ channel: Channel; total: number }[]> {
    const trend = await this.salesTrend();
    const totals: Record<Channel, number> = {
      [Channel.TOKOPEDIA]: 0,
      [Channel.SHOPEE]: 0,
      [Channel.WEBSITE]: 0,
      [Channel.TIKTOKSHOP]: 0,
    };
    for (const day of trend) {
      totals[Channel.TOKOPEDIA] += day.tokopedia;
      totals[Channel.SHOPEE] += day.shopee;
      totals[Channel.WEBSITE] += day.website;
      totals[Channel.TIKTOKSHOP] += day.tiktokshop;
    }
    return Object.values(Channel).map((channel) => ({ channel, total: totals[channel] }));
  }

  async stats() {
    const totals = await this.channelTotals();
    const totalPenjualan = totals.reduce((s, c) => s + c.total, 0);

    const totalTransaksi = await this.transactionRepo.count();

    const stokMenipis = await this.stockRepo
      .createQueryBuilder('stock')
      .innerJoin('stock.product', 'product')
      .where('stock.jumlah_stok <= product.stok_minimum')
      .getCount();

    const channels = Object.values(Channel);
    const latestLogs = await Promise.all(
      channels.map((channel) =>
        this.syncLogRepo.findOne({ where: { channel }, order: { waktuMulai: 'DESC' } }),
      ),
    );
    const channelBermasalah = latestLogs.filter(
      (log) => !log || log.status === SyncStatus.FAILED,
    ).length;

    return {
      totalPenjualan,
      totalTransaksi,
      stokMenipis,
      channelAktif: channels.length - channelBermasalah,
      channelBermasalah,
    };
  }
}
