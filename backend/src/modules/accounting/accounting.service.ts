import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Repository } from 'typeorm';
import { Channel } from '../../common/channel.enum';
import { REVENUE_STATUSES } from '../../common/transaction-status.util';
import { Transaction } from '../../database/entities/transaction.entity';

const PRODUK_PDF_LIMIT = 15;

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

interface PdfTableColumn {
  label: string;
  width: number;
  align?: 'left' | 'right';
}

const CHANNEL_LABEL: Record<Channel, string> = {
  [Channel.TOKOPEDIA]: 'Tokopedia',
  [Channel.SHOPEE]: 'Shopee',
  [Channel.WEBSITE]: 'Website',
  [Channel.TIKTOKSHOP]: 'TikTok Shop',
};

interface LabaRugiParams {
  channel?: Channel;
  startDate?: string;
  endDate?: string;
}

export interface LabaRugiSummaryDto {
  penjualanBarang: number;
  pendapatanOngkir: number;
  totalPendapatan: number;
  hpp: number;
  labaKotor: number;
  marginPersen: number;
  jumlahTransaksi: number;
}

export interface LabaRugiChannelDto {
  channel: Channel;
  penjualanBarang: number;
  pendapatanOngkir: number;
  totalPendapatan: number;
  hpp: number;
  labaKotor: number;
  marginPersen: number;
  jumlahTransaksi: number;
}

export interface LabaRugiProdukDto {
  productId: string;
  namaProduk: string;
  qty: number;
  penjualanBarang: number;
  hpp: number;
  labaKotor: number;
}

export interface LabaRugiTrendDto {
  periode: string;
  totalPendapatan: number;
  hpp: number;
  labaKotor: number;
}

export interface LabaRugiResponseDto {
  summary: LabaRugiSummaryDto;
  perChannel: LabaRugiChannelDto[];
  perProduk: LabaRugiProdukDto[];
  trend: LabaRugiTrendDto[];
}

function marginOf(totalPendapatan: number, labaKotor: number): number {
  return totalPendapatan > 0 ? Math.round((labaKotor / totalPendapatan) * 1000) / 10 : 0;
}

@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepo: Repository<Transaction>,
  ) {}

  private buildFilteredQuery(params: LabaRugiParams) {
    const qb = this.transactionRepo
      .createQueryBuilder('t')
      .innerJoin('t.product', 'product')
      .where('t.status IN (:...statuses)', { statuses: REVENUE_STATUSES });

    if (params.channel) {
      qb.andWhere('t.channel = :channel', { channel: params.channel });
    }
    if (params.startDate) {
      qb.andWhere('t.tanggal_transaksi >= :startDate', {
        startDate: new Date(params.startDate),
      });
    }
    if (params.endDate) {
      const endOfDay = new Date(params.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      qb.andWhere('t.tanggal_transaksi <= :endDate', { endDate: endOfDay });
    }

    return qb;
  }

  async labaRugi(params: LabaRugiParams): Promise<LabaRugiResponseDto> {
    const [summary, perChannel, perProduk, trend] = await Promise.all([
      this.summary(params),
      this.perChannel(params),
      this.perProduk(params),
      this.trend(params),
    ]);

    return { summary, perChannel, perProduk, trend };
  }

  private async summary(params: LabaRugiParams): Promise<LabaRugiSummaryDto> {
    const raw = await this.buildFilteredQuery(params)
      .select('COALESCE(SUM(t.harga_jual * t.qty), 0)', 'penjualanBarang')
      .addSelect('COALESCE(SUM(t.ongkos_kirim), 0)', 'pendapatanOngkir')
      .addSelect('COALESCE(SUM(product.harga_dasar * t.qty), 0)', 'hpp')
      .addSelect('COUNT(*)', 'jumlahTransaksi')
      .getRawOne();

    const penjualanBarang = Number(raw.penjualanBarang);
    const pendapatanOngkir = Number(raw.pendapatanOngkir);
    const hpp = Number(raw.hpp);
    const totalPendapatan = penjualanBarang + pendapatanOngkir;
    const labaKotor = totalPendapatan - hpp;

    return {
      penjualanBarang,
      pendapatanOngkir,
      totalPendapatan,
      hpp,
      labaKotor,
      marginPersen: marginOf(totalPendapatan, labaKotor),
      jumlahTransaksi: Number(raw.jumlahTransaksi),
    };
  }

  private async perChannel(params: LabaRugiParams): Promise<LabaRugiChannelDto[]> {
    const rows = await this.buildFilteredQuery(params)
      .select('t.channel', 'channel')
      .addSelect('COALESCE(SUM(t.harga_jual * t.qty), 0)', 'penjualanBarang')
      .addSelect('COALESCE(SUM(t.ongkos_kirim), 0)', 'pendapatanOngkir')
      .addSelect('COALESCE(SUM(product.harga_dasar * t.qty), 0)', 'hpp')
      .addSelect('COUNT(*)', 'jumlahTransaksi')
      .groupBy('t.channel')
      .getRawMany();

    const byChannel = new Map<Channel, LabaRugiChannelDto>();
    for (const row of rows) {
      const penjualanBarang = Number(row.penjualanBarang);
      const pendapatanOngkir = Number(row.pendapatanOngkir);
      const hpp = Number(row.hpp);
      const totalPendapatan = penjualanBarang + pendapatanOngkir;
      const labaKotor = totalPendapatan - hpp;
      byChannel.set(row.channel as Channel, {
        channel: row.channel,
        penjualanBarang,
        pendapatanOngkir,
        totalPendapatan,
        hpp,
        labaKotor,
        marginPersen: marginOf(totalPendapatan, labaKotor),
        jumlahTransaksi: Number(row.jumlahTransaksi),
      });
    }

    return Object.values(Channel).map(
      (channel) =>
        byChannel.get(channel) ?? {
          channel,
          penjualanBarang: 0,
          pendapatanOngkir: 0,
          totalPendapatan: 0,
          hpp: 0,
          labaKotor: 0,
          marginPersen: 0,
          jumlahTransaksi: 0,
        },
    );
  }

  private async perProduk(params: LabaRugiParams): Promise<LabaRugiProdukDto[]> {
    const rows = await this.buildFilteredQuery(params)
      .select('product.id', 'productId')
      .addSelect('product.nama_produk', 'namaProduk')
      .addSelect('COALESCE(SUM(t.qty), 0)', 'qty')
      .addSelect('COALESCE(SUM(t.harga_jual * t.qty), 0)', 'penjualanBarang')
      .addSelect('COALESCE(SUM(product.harga_dasar * t.qty), 0)', 'hpp')
      .groupBy('product.id')
      .addGroupBy('product.nama_produk')
      .getRawMany();

    return rows
      .map((row) => {
        const penjualanBarang = Number(row.penjualanBarang);
        const hpp = Number(row.hpp);
        return {
          productId: row.productId,
          namaProduk: row.namaProduk,
          qty: Number(row.qty),
          penjualanBarang,
          hpp,
          labaKotor: penjualanBarang - hpp,
        };
      })
      .sort((a, b) => b.labaKotor - a.labaKotor);
  }

  private async trend(params: LabaRugiParams): Promise<LabaRugiTrendDto[]> {
    const rows = await this.buildFilteredQuery(params)
      .select("to_char(date_trunc('month', t.tanggal_transaksi), 'YYYY-MM')", 'periode')
      .addSelect('COALESCE(SUM(t.harga_jual * t.qty + t.ongkos_kirim), 0)', 'totalPendapatan')
      .addSelect('COALESCE(SUM(product.harga_dasar * t.qty), 0)', 'hpp')
      .groupBy("date_trunc('month', t.tanggal_transaksi)")
      .orderBy("date_trunc('month', t.tanggal_transaksi)", 'ASC')
      .getRawMany();

    return rows.map((row) => {
      const totalPendapatan = Number(row.totalPendapatan);
      const hpp = Number(row.hpp);
      return {
        periode: row.periode,
        totalPendapatan,
        hpp,
        labaKotor: totalPendapatan - hpp,
      };
    });
  }

  async exportToExcel(params: LabaRugiParams): Promise<Buffer> {
    const { summary, perChannel, perProduk, trend } = await this.labaRugi(params);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Rekap Omnichannel';
    workbook.created = new Date();

    this.buildSummarySheet(workbook, summary);
    this.buildChannelSheet(workbook, perChannel);
    this.buildProdukSheet(workbook, perProduk);
    this.buildTrendSheet(workbook, trend);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportToPdf(params: LabaRugiParams): Promise<Buffer> {
    const { summary, perChannel, perProduk } = await this.labaRugi(params);

    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    const done = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    this.drawPdfHeader(doc, params);
    this.drawPdfSummary(doc, summary);
    this.drawPdfChannelTable(doc, perChannel);
    this.drawPdfProdukTable(doc, perProduk);
    this.drawPdfFooterOnAllPages(doc);

    doc.end();
    return done;
  }

  private drawPdfHeader(doc: PDFKit.PDFDocument, params: LabaRugiParams): void {
    const periode =
      params.startDate || params.endDate
        ? `${params.startDate ?? '...'} s/d ${params.endDate ?? '...'}`
        : 'Seluruh Periode';

    doc.fontSize(18).font('Helvetica-Bold').text('Laporan Laba Rugi');
    doc.fontSize(11).font('Helvetica').fillColor('#555555').text('Rekap Omnichannel');
    doc
      .fontSize(9)
      .text(`Periode: ${periode}`)
      .text(`Dicetak: ${new Date().toLocaleString('id-ID')}`)
      .fillColor('#000000');
    doc.moveDown(1.5);
  }

  private drawPdfSummary(doc: PDFKit.PDFDocument, summary: LabaRugiSummaryDto): void {
    doc.fontSize(13).font('Helvetica-Bold').text('Ringkasan');
    doc.moveDown(0.5);

    const rows: [string, string][] = [
      ['Penjualan Barang', formatRupiah(summary.penjualanBarang)],
      ['Pendapatan Ongkir', formatRupiah(summary.pendapatanOngkir)],
      ['Total Pendapatan', formatRupiah(summary.totalPendapatan)],
      ['HPP (Harga Pokok Penjualan)', formatRupiah(summary.hpp)],
      ['Laba Kotor', formatRupiah(summary.labaKotor)],
      ['Margin', `${summary.marginPersen}%`],
      ['Jumlah Transaksi', String(summary.jumlahTransaksi)],
    ];

    doc.fontSize(10).font('Helvetica');
    for (const [label, value] of rows) {
      const y = doc.y;
      doc.font('Helvetica').text(label, 50, y, { width: 250 });
      doc.font('Helvetica-Bold').text(value, 300, y, { width: 200, align: 'right' });
    }
    doc.moveDown(1.5);
  }

  private drawPdfChannelTable(doc: PDFKit.PDFDocument, perChannel: LabaRugiChannelDto[]): void {
    doc.fontSize(13).font('Helvetica-Bold').text('Rekap per Channel');
    doc.moveDown(0.3);

    const columns: PdfTableColumn[] = [
      { label: 'Channel', width: 90 },
      { label: 'Pendapatan', width: 100, align: 'right' },
      { label: 'HPP', width: 90, align: 'right' },
      { label: 'Laba Kotor', width: 100, align: 'right' },
      { label: 'Margin', width: 60, align: 'right' },
    ];
    const rows = perChannel.map((row) => [
      CHANNEL_LABEL[row.channel],
      formatRupiah(row.totalPendapatan),
      formatRupiah(row.hpp),
      formatRupiah(row.labaKotor),
      `${row.marginPersen}%`,
    ]);

    this.drawTable(doc, columns, rows);
    doc.moveDown(1.5);
  }

  private drawPdfProdukTable(doc: PDFKit.PDFDocument, perProduk: LabaRugiProdukDto[]): void {
    doc.fontSize(13).font('Helvetica-Bold').text('Rekap per Produk');
    doc.moveDown(0.3);

    const top = perProduk.slice(0, PRODUK_PDF_LIMIT);
    const columns: PdfTableColumn[] = [
      { label: 'Produk', width: 190 },
      { label: 'Qty', width: 50, align: 'right' },
      { label: 'Penjualan', width: 100, align: 'right' },
      { label: 'Laba Kotor', width: 100, align: 'right' },
    ];
    const rows = top.map((row) => [
      row.namaProduk,
      String(row.qty),
      formatRupiah(row.penjualanBarang),
      formatRupiah(row.labaKotor),
    ]);

    this.drawTable(doc, columns, rows);

    if (perProduk.length > PRODUK_PDF_LIMIT) {
      doc.moveDown(0.3);
      doc
        .fontSize(8)
        .font('Helvetica-Oblique')
        .fillColor('#777777')
        .text(`Menampilkan ${PRODUK_PDF_LIMIT} dari ${perProduk.length} produk (diurutkan laba kotor tertinggi).`)
        .fillColor('#000000');
    }
  }

  /**
   * pdfkit menggambar di koordinat absolut, tidak auto-flow seperti HTML -
   * helper ini yang urus wrap ke halaman baru + gambar ulang header kolom
   * kalau tabel kepanjangan.
   */
  private drawTable(
    doc: PDFKit.PDFDocument,
    columns: PdfTableColumn[],
    rows: string[][],
    rowHeight = 20,
  ): void {
    const startX = 50;
    const bottomLimit = doc.page.height - doc.page.margins.bottom;

    const drawHeaderRow = () => {
      let x = startX;
      doc.fontSize(9).font('Helvetica-Bold');
      for (const col of columns) {
        doc.text(col.label, x, doc.y, { width: col.width, align: col.align ?? 'left' });
        x += col.width;
      }
      doc.moveDown(0.5);
      doc
        .moveTo(startX, doc.y)
        .lineTo(startX + columns.reduce((s, c) => s + c.width, 0), doc.y)
        .strokeColor('#cccccc')
        .stroke();
      doc.moveDown(0.3);
    };

    drawHeaderRow();
    doc.font('Helvetica').fontSize(9);

    for (const row of rows) {
      if (doc.y + rowHeight > bottomLimit) {
        doc.addPage();
        drawHeaderRow();
        doc.font('Helvetica').fontSize(9);
      }
      const y = doc.y;
      let x = startX;
      row.forEach((cell, i) => {
        const col = columns[i];
        doc.text(cell, x, y, { width: col.width, align: col.align ?? 'left' });
        x += col.width;
      });
      doc.moveDown(0.7);
    }
  }

  private drawPdfFooterOnAllPages(doc: PDFKit.PDFDocument): void {
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const bottom = doc.page.height - doc.page.margins.bottom + 15;
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#999999')
        .text(
          `Dibuat otomatis oleh Rekap Omnichannel - Halaman ${i + 1} dari ${range.count}`,
          50,
          bottom,
          { align: 'center', width: doc.page.width - 100 },
        )
        .fillColor('#000000');
    }
  }

  private buildSummarySheet(workbook: ExcelJS.Workbook, summary: LabaRugiSummaryDto) {
    const sheet = workbook.addWorksheet('Ringkasan');
    sheet.columns = [
      { header: 'Keterangan', key: 'label', width: 28 },
      { header: 'Nilai', key: 'value', width: 20 },
    ];
    sheet.getRow(1).font = { bold: true };

    sheet.addRow({ label: 'Penjualan Barang', value: summary.penjualanBarang });
    sheet.addRow({ label: 'Pendapatan Ongkir', value: summary.pendapatanOngkir });
    sheet.addRow({ label: 'Total Pendapatan', value: summary.totalPendapatan });
    sheet.addRow({ label: 'HPP (Harga Pokok Penjualan)', value: summary.hpp });
    sheet.addRow({ label: 'Laba Kotor', value: summary.labaKotor });
    sheet.addRow({ label: 'Margin (%)', value: summary.marginPersen });
    sheet.addRow({ label: 'Jumlah Transaksi', value: summary.jumlahTransaksi });

    for (let i = 2; i <= 6; i++) {
      sheet.getCell(`B${i}`).numFmt = '#,##0';
    }
  }

  private buildChannelSheet(workbook: ExcelJS.Workbook, perChannel: LabaRugiChannelDto[]) {
    const sheet = workbook.addWorksheet('Rekap per Channel');
    sheet.columns = [
      { header: 'Channel', key: 'channel', width: 16 },
      { header: 'Penjualan Barang', key: 'penjualanBarang', width: 18 },
      { header: 'Pendapatan Ongkir', key: 'pendapatanOngkir', width: 18 },
      { header: 'Total Pendapatan', key: 'totalPendapatan', width: 18 },
      { header: 'HPP', key: 'hpp', width: 16 },
      { header: 'Laba Kotor', key: 'labaKotor', width: 16 },
      { header: 'Margin (%)', key: 'marginPersen', width: 12 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const row of perChannel) {
      sheet.addRow({ ...row, channel: CHANNEL_LABEL[row.channel] });
    }
    for (const key of ['penjualanBarang', 'pendapatanOngkir', 'totalPendapatan', 'hpp', 'labaKotor']) {
      sheet.getColumn(key).numFmt = '#,##0';
    }
  }

  private buildProdukSheet(workbook: ExcelJS.Workbook, perProduk: LabaRugiProdukDto[]) {
    const sheet = workbook.addWorksheet('Rekap per Produk');
    sheet.columns = [
      { header: 'Produk', key: 'namaProduk', width: 30 },
      { header: 'Total Qty', key: 'qty', width: 12 },
      { header: 'Penjualan Barang', key: 'penjualanBarang', width: 18 },
      { header: 'HPP', key: 'hpp', width: 16 },
      { header: 'Laba Kotor', key: 'labaKotor', width: 16 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const row of perProduk) {
      sheet.addRow(row);
    }
    for (const key of ['penjualanBarang', 'hpp', 'labaKotor']) {
      sheet.getColumn(key).numFmt = '#,##0';
    }
  }

  private buildTrendSheet(workbook: ExcelJS.Workbook, trend: LabaRugiTrendDto[]) {
    const sheet = workbook.addWorksheet('Tren Bulanan');
    sheet.columns = [
      { header: 'Periode', key: 'periode', width: 12 },
      { header: 'Total Pendapatan', key: 'totalPendapatan', width: 18 },
      { header: 'HPP', key: 'hpp', width: 16 },
      { header: 'Laba Kotor', key: 'labaKotor', width: 16 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const row of trend) {
      sheet.addRow(row);
    }
    for (const key of ['totalPendapatan', 'hpp', 'labaKotor']) {
      sheet.getColumn(key).numFmt = '#,##0';
    }
  }
}
