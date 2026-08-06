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
 * Integration layer untuk Shopee Open Platform API v2 (signature HMAC-SHA256
 * + access/refresh token). Endpoint yang perlu diimplementasikan:
 * order.get_order_list, order.get_order_detail, product.update_stock, push webhook.
 */
@Injectable()
export class ShopeeService {
  private readonly logger = new Logger(ShopeeService.name);

  constructor(private readonly config: ConfigService) {}

  async fetchNewOrders(shopId: string, accessToken: string): Promise<NormalizedOrder[]> {
    this.logger.warn(
      `ShopeeService.fetchNewOrders belum diimplementasikan (shop=${shopId}, token tersedia=${!!accessToken})`,
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
      `ShopeeService.updateStock belum diimplementasikan (shop=${shopId}, product=${channelProductId}, stok=${jumlahStok})`,
    );
  }
}
