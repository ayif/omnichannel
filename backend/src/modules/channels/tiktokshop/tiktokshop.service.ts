import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface NormalizedOrder {
  channelOrderId: string;
  channelProductId: string;
  qty: number;
  hargaJual: string;
  ongkosKirim: string;
  status: string;
  tanggalTransaksi: Date;
  rawPayload: Record<string, unknown>;
}

/**
 * Integration layer untuk TikTok Shop Partner Center API v2 (app_key/app_secret
 * + signature HMAC-SHA256, mirip Shopee). Endpoint yang perlu diimplementasikan:
 * Order List, Order Detail, Product Search (buat gambar & katalog), Update Stock.
 *
 * Sejak merger Tokopedia ke TikTok Shop, integrasi toko Tokopedia baru pun
 * diarahkan lewat API ini juga (lihat catatan di tokopedia-oauth.provider.ts) -
 * jadi begitu kredensial TikTok Shop Partner Center tersedia, ini berpotensi
 * jadi satu-satunya integrasi marketplace yang perlu dirawat untuk kedua channel.
 */
@Injectable()
export class TikTokShopService {
  private readonly logger = new Logger(TikTokShopService.name);

  constructor(private readonly config: ConfigService) {}

  async fetchNewOrders(shopId: string, accessToken: string): Promise<NormalizedOrder[]> {
    this.logger.warn(
      `TikTokShopService.fetchNewOrders belum diimplementasikan (shop=${shopId}, token tersedia=${!!accessToken})`,
    );
    return [];
  }

  async updateStock(
    shopId: string,
    accessToken: string,
    channelProductId: string,
    jumlahStok: number,
  ): Promise<void> {
    this.logger.warn(
      `TikTokShopService.updateStock belum diimplementasikan (shop=${shopId}, product=${channelProductId}, stok=${jumlahStok})`,
    );
  }
}
