import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import ExcelJS from 'exceljs';
import { Repository } from 'typeorm';
import { Channel } from '../../common/channel.enum';
import {
  Transaction,
  TransactionStatus,
} from '../../database/entities/transaction.entity';

const CHANNEL_LABEL: Record<Channel, string> = {
  [Channel.TOKOPEDIA]: 'Tokopedia',
  [Channel.SHOPEE]: 'Shopee',
  [Channel.WEBSITE]: 'Website',
  [Channel.TIKTOKSHOP]: 'TikTok Shop',
};

const STATUS_LABEL: Record<TransactionStatus, string> = {
  [TransactionStatus.PENDING]: 'Pending',
  [TransactionStatus.PAID]: 'Dibayar',
  [TransactionStatus.SHIPPED]: 'Dikirim',
  [TransactionStatus.COMPLETED]: 'Selesai',
  [TransactionStatus.CANCELLED]: 'Dibatalkan',
  [TransactionStatus.REFUND]: 'Refund',
};

export interface TransactionDto {
  id: string;
  channel: Channel;
  channelOrderId: string;
  productId: string;
  namaProduk: string;
  qty: number;
  hargaJual: number;
  ongkosKirim: number;
  status: TransactionStatus;
  tanggalTransaksi: string;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  async findAll(params: {
    channel?: Channel;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<TransactionDto[]> {
    const qb = this.buildFilteredQuery(params);
    qb.orderBy('t.tanggalTransaksi', 'DESC');

    if (params.limit) {
      qb.take(params.limit);
    }

    const rows = await qb.getMany();

    return rows.map((t) => this.toDto(t));
  }

  async exportToExcel(params: {
    channel?: Channel;
    startDate?: string;
    endDate?: string;
  }): Promise<Buffer> {
    const qb = this.buildFilteredQuery(params);
    qb.orderBy('t.tanggalTransaksi', 'ASC');
    const rows = await qb.getMany();
    const transactions = rows.map((t) => this.toDto(t));

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Rekap Omnichannel';
    workbook.created = new Date();

    this.buildDetailSheet(workbook, transactions);
    this.buildChannelSummarySheet(workbook, transactions);
    this.buildProductSummarySheet(workbook, transactions);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private buildFilteredQuery(params: {
    channel?: Channel;
    startDate?: string;
    endDate?: string;
  }) {
    const qb = this.transactionRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.product', 'product');

    if (params.channel) {
      qb.andWhere('t.channel = :channel', { channel: params.channel });
    }
    if (params.startDate) {
      qb.andWhere('t.tanggalTransaksi >= :startDate', {
        startDate: new Date(params.startDate),
      });
    }
    if (params.endDate) {
      const endOfDay = new Date(params.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      qb.andWhere('t.tanggalTransaksi <= :endDate', { endDate: endOfDay });
    }

    return qb;
  }

  private toDto(t: Transaction): TransactionDto {
    return {
      id: t.id,
      channel: t.channel,
      channelOrderId: t.channelOrderId,
      productId: t.productId,
      namaProduk: t.product?.namaProduk ?? '',
      qty: t.qty,
      hargaJual: Number(t.hargaJual),
      ongkosKirim: Number(t.ongkosKirim),
      status: t.status,
      tanggalTransaksi: t.tanggalTransaksi.toISOString(),
    };
  }

  private buildDetailSheet(
    workbook: ExcelJS.Workbook,
    transactions: TransactionDto[],
  ) {
    const sheet = workbook.addWorksheet('Detail Transaksi');
    sheet.columns = [
      { header: 'Tanggal', key: 'tanggal', width: 20 },
      { header: 'Channel', key: 'channel', width: 14 },
      { header: 'No. Order', key: 'order', width: 24 },
      { header: 'Produk', key: 'produk', width: 30 },
      { header: 'Qty', key: 'qty', width: 8 },
      { header: 'Harga Jual', key: 'hargaJual', width: 16 },
      { header: 'Ongkos Kirim', key: 'ongkosKirim', width: 16 },
      { header: 'Total', key: 'total', width: 16 },
      { header: 'Status', key: 'status', width: 14 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const t of transactions) {
      sheet.addRow({
        tanggal: new Date(t.tanggalTransaksi),
        channel: CHANNEL_LABEL[t.channel],
        order: t.channelOrderId,
        produk: t.namaProduk,
        qty: t.qty,
        hargaJual: t.hargaJual,
        ongkosKirim: t.ongkosKirim,
        total: t.hargaJual * t.qty + t.ongkosKirim,
        status: STATUS_LABEL[t.status],
      });
    }

    sheet.getColumn('tanggal').numFmt = 'dd/mm/yyyy hh:mm';
    for (const key of ['hargaJual', 'ongkosKirim', 'total']) {
      sheet.getColumn(key).numFmt = '#,##0';
    }
  }

  private buildChannelSummarySheet(
    workbook: ExcelJS.Workbook,
    transactions: TransactionDto[],
  ) {
    const sheet = workbook.addWorksheet('Rekap per Channel');
    sheet.columns = [
      { header: 'Channel', key: 'channel', width: 16 },
      { header: 'Total Qty', key: 'qty', width: 12 },
      { header: 'Total Omzet', key: 'omzet', width: 18 },
    ];
    sheet.getRow(1).font = { bold: true };

    const totals = new Map<Channel, { qty: number; omzet: number }>();
    for (const t of transactions) {
      const entry = totals.get(t.channel) ?? { qty: 0, omzet: 0 };
      entry.qty += t.qty;
      entry.omzet += t.hargaJual * t.qty + t.ongkosKirim;
      totals.set(t.channel, entry);
    }

    for (const [channel, entry] of totals) {
      sheet.addRow({
        channel: CHANNEL_LABEL[channel],
        qty: entry.qty,
        omzet: entry.omzet,
      });
    }
    sheet.getColumn('omzet').numFmt = '#,##0';
  }

  private buildProductSummarySheet(
    workbook: ExcelJS.Workbook,
    transactions: TransactionDto[],
  ) {
    const sheet = workbook.addWorksheet('Rekap per Produk');
    sheet.columns = [
      { header: 'Produk', key: 'produk', width: 30 },
      { header: 'Total Qty', key: 'qty', width: 12 },
      { header: 'Total Omzet', key: 'omzet', width: 18 },
      { header: 'Rata-rata Harga Jual', key: 'rataHarga', width: 20 },
    ];
    sheet.getRow(1).font = { bold: true };

    const totals = new Map<
      string,
      { qty: number; omzet: number; hargaSum: number; count: number }
    >();
    for (const t of transactions) {
      const entry = totals.get(t.namaProduk) ?? {
        qty: 0,
        omzet: 0,
        hargaSum: 0,
        count: 0,
      };
      entry.qty += t.qty;
      entry.omzet += t.hargaJual * t.qty + t.ongkosKirim;
      entry.hargaSum += t.hargaJual;
      entry.count += 1;
      totals.set(t.namaProduk, entry);
    }

    for (const [produk, entry] of totals) {
      sheet.addRow({
        produk,
        qty: entry.qty,
        omzet: entry.omzet,
        rataHarga: Math.round(entry.hargaSum / entry.count),
      });
    }
    for (const key of ['omzet', 'rataHarga']) {
      sheet.getColumn(key).numFmt = '#,##0';
    }
  }
}
