export enum Channel {
  TOKOPEDIA = "tokopedia",
  SHOPEE = "shopee",
  WEBSITE = "website",
  TIKTOKSHOP = "tiktokshop",
}

export enum TransactionStatus {
  PENDING = "pending",
  PAID = "paid",
  SHIPPED = "shipped",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REFUND = "refund",
}

export enum SyncStatus {
  RUNNING = "running",
  SUCCESS = "success",
  FAILED = "failed",
}

export enum Role {
  ADMIN = "admin",
  STAFF = "staff",
  GUDANG = "gudang",
}

export const ROLE_LABEL: Record<Role, string> = {
  [Role.ADMIN]: "Admin",
  [Role.STAFF]: "Staf",
  [Role.GUDANG]: "Gudang",
};

export interface Product {
  id: string;
  sku: string;
  namaProduk: string;
  kategori: string;
  hargaDasar: number;
  jumlahStok: number;
  stokMinimum: number;
  gambarUrl: string | null;
}

export interface Transaction {
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

export interface SyncLog {
  id: string;
  channel: Channel;
  status: SyncStatus;
  waktuMulai: string;
  waktuSelesai: string | null;
  jumlahDataDitarik: number;
  errorMessage: string | null;
}

export enum ChannelAccountStatus {
  CONNECTED = "connected",
  EXPIRED = "expired",
  REVOKED = "revoked",
}

export interface ChannelAccount {
  id: string;
  channel: Channel;
  shopId: string;
  namaToko: string;
  status: ChannelAccountStatus;
  expiresAt: string | null;
  createdAt: string;
}

export const CHANNEL_ACCOUNT_STATUS_LABEL: Record<ChannelAccountStatus, string> = {
  [ChannelAccountStatus.CONNECTED]: "Terhubung",
  [ChannelAccountStatus.EXPIRED]: "Kedaluwarsa",
  [ChannelAccountStatus.REVOKED]: "Dicabut",
};

export const CHANNEL_LABEL: Record<Channel, string> = {
  [Channel.TOKOPEDIA]: "Tokopedia",
  [Channel.SHOPEE]: "Shopee",
  [Channel.WEBSITE]: "Website",
  [Channel.TIKTOKSHOP]: "TikTok Shop",
};

export const TRANSACTION_STATUS_LABEL: Record<TransactionStatus, string> = {
  [TransactionStatus.PENDING]: "Pending",
  [TransactionStatus.PAID]: "Dibayar",
  [TransactionStatus.SHIPPED]: "Dikirim",
  [TransactionStatus.COMPLETED]: "Selesai",
  [TransactionStatus.CANCELLED]: "Dibatalkan",
  [TransactionStatus.REFUND]: "Refund",
};
