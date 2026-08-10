import { TransactionStatus } from '../database/entities/transaction.entity';

/**
 * Status transaksi yang dihitung sebagai penjualan valid (omzet/qty terjual)
 * di seluruh laporan - exclude pending (belum tentu jadi), cancelled & refund.
 */
export const REVENUE_STATUSES = [
  TransactionStatus.PAID,
  TransactionStatus.SHIPPED,
  TransactionStatus.COMPLETED,
];
