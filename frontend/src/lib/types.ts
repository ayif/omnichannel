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

export interface LabaRugiSummary {
  penjualanBarang: number;
  pendapatanOngkir: number;
  totalPendapatan: number;
  hpp: number;
  labaKotor: number;
  marginPersen: number;
  jumlahTransaksi: number;
}

export interface LabaRugiChannel {
  channel: Channel;
  penjualanBarang: number;
  pendapatanOngkir: number;
  totalPendapatan: number;
  hpp: number;
  labaKotor: number;
  marginPersen: number;
  jumlahTransaksi: number;
}

export interface LabaRugiProduk {
  productId: string;
  namaProduk: string;
  qty: number;
  penjualanBarang: number;
  hpp: number;
  labaKotor: number;
}

export interface LabaRugiTrend {
  periode: string;
  totalPendapatan: number;
  hpp: number;
  labaKotor: number;
}

export interface LabaRugiResponse {
  summary: LabaRugiSummary;
  perChannel: LabaRugiChannel[];
  perProduk: LabaRugiProduk[];
  trend: LabaRugiTrend[];
}

export enum AuditAction {
  LOGIN_SUCCESS = "login_success",
  LOGIN_FAILED = "login_failed",
  CHANNEL_CONNECT = "channel_connect",
  CHANNEL_DISCONNECT = "channel_disconnect",
  SYNC_TRIGGER = "sync_trigger",
  USER_CREATE = "user_create",
  USER_UPDATE = "user_update",
  USER_DELETE = "user_delete",
}

export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  [AuditAction.LOGIN_SUCCESS]: "Login Berhasil",
  [AuditAction.LOGIN_FAILED]: "Login Gagal",
  [AuditAction.CHANNEL_CONNECT]: "Toko Terhubung",
  [AuditAction.CHANNEL_DISCONNECT]: "Toko Diputuskan",
  [AuditAction.SYNC_TRIGGER]: "Sync Manual",
  [AuditAction.USER_CREATE]: "User Ditambahkan",
  [AuditAction.USER_UPDATE]: "User Diubah",
  [AuditAction.USER_DELETE]: "User Dihapus",
};

export enum NotificationType {
  STOCK_LOW = "stock_low",
  SYNC_FAILED = "sync_failed",
}

export enum NotificationSeverity {
  WARNING = "warning",
  CRITICAL = "critical",
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  entityType: string;
  entityId: string;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface ChannelQty {
  channel: Channel;
  qty: number;
}

export interface ProdukTerlaris {
  productId: string;
  namaProduk: string;
  qtyTerjual: number;
  omzet: number;
  perChannel: ChannelQty[];
}

export interface StokTercepatHabis {
  productId: string;
  namaProduk: string;
  stokSaatIni: number;
  avgPerHari: number;
  perkiraanHariTersisa: number | null;
  perChannel: ChannelQty[];
}

export interface BusinessSettings {
  id: string;
  namaBisnis: string;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  updatedAt: string;
}

export interface AppUser {
  id: string;
  email: string;
  nama: string;
  role: Role;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string | null;
  entityId: string | null;
  userNama: string | null;
  userEmail: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}
