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
 * Integration layer untuk Tokopedia Seller API (OAuth2 client credentials).
 * Endpoint yang perlu diimplementasikan: Order List, Order Detail,
 * Acknowledge Order, Update Stock, Update Price.
 */
@Injectable()
export class TokopediaService {
  private readonly logger = new Logger(TokopediaService.name);

  constructor(private readonly config: ConfigService) {}

  async fetchNewOrders(shopId: string, accessToken: string): Promise<NormalizedOrder[]> {
    this.logger.warn(
      `TokopediaService.fetchNewOrders belum diimplementasikan (shop=${shopId}, token tersedia=${!!accessToken})`,
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
      `TokopediaService.updateStock belum diimplementasikan (shop=${shopId}, product=${channelProductId}, stok=${jumlahStok})`,
    );
  }
}
