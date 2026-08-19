import { createHmac } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel } from '../../../common/channel.enum';
import { ChannelApiConfigService } from '../channel-api-config.service';
import type {
  ChannelOAuthProvider,
  OAuthTokenResult,
} from './oauth-provider.interface';

interface ShopeeTokenResponse {
  access_token: string;
  refresh_token: string;
  expire_in: number;
  shop_id?: number;
  error?: string;
  message?: string;
}

/**
 * Alur autentikasi Shopee Open Platform v2 (partner_id + partner_key,
 * signature HMAC-SHA256). Endpoint & skema signature ini stabil/terdokumentasi
 * resmi - tapi tetap cek https://open.shopee.com begitu partner_id asli
 * sudah didaftarkan, terutama untuk region/base URL yang tepat.
 */
@Injectable()
export class ShopeeOAuthProvider implements ChannelOAuthProvider {
  constructor(
    private readonly config: ConfigService,
    private readonly apiConfig: ChannelApiConfigService,
  ) {}

  /** Kredensial diisi lewat halaman Pengaturan (DB) - .env cuma fallback lama. */
  private async resolvedConfig() {
    const db = await this.apiConfig.getDecrypted(Channel.SHOPEE);
    return {
      partnerId:
        db.partnerId || this.config.get<string>('SHOPEE_PARTNER_ID') || '',
      partnerKey:
        db.partnerKey || this.config.get<string>('SHOPEE_PARTNER_KEY') || '',
      baseUrl:
        db.baseUrl ||
        this.config.get<string>('SHOPEE_BASE_URL') ||
        'https://partner.shopeemobile.com',
    };
  }

  private get redirectUri(): string {
    const backendUrl =
      this.config.get<string>('BACKEND_PUBLIC_URL') ?? 'http://localhost:3000';
    return `${backendUrl}/channel-accounts/shopee/callback`;
  }

  private sign(
    partnerId: string,
    partnerKey: string,
    path: string,
    timestamp: number,
  ): string {
    const baseString = `${partnerId}${path}${timestamp}`;
    return createHmac('sha256', partnerKey).update(baseString).digest('hex');
  }

  async getAuthorizationUrl(state: string): Promise<string> {
    const { partnerId, partnerKey, baseUrl } = await this.resolvedConfig();
    const path = '/api/v2/shop/auth_partner';
    const timestamp = Math.floor(Date.now() / 1000);
    const redirect = `${this.redirectUri}?state=${encodeURIComponent(state)}`;
    const params = new URLSearchParams({
      partner_id: partnerId,
      timestamp: String(timestamp),
      sign: this.sign(partnerId, partnerKey, path, timestamp),
      redirect,
    });
    return `${baseUrl}${path}?${params.toString()}`;
  }

  async exchangeCode({
    code,
    shopId,
  }: {
    code: string;
    shopId?: string;
  }): Promise<OAuthTokenResult> {
    const { partnerId, partnerKey, baseUrl } = await this.resolvedConfig();
    const path = '/api/v2/auth/token/get';
    const timestamp = Math.floor(Date.now() / 1000);
    const params = new URLSearchParams({
      partner_id: partnerId,
      timestamp: String(timestamp),
      sign: this.sign(partnerId, partnerKey, path, timestamp),
    });

    const res = await fetch(`${baseUrl}${path}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        shop_id: shopId ? Number(shopId) : undefined,
        partner_id: Number(partnerId),
      }),
    });

    const data = (await res.json()) as ShopeeTokenResponse;
    if (!res.ok || data.error) {
      throw new Error(
        `Shopee token exchange gagal: ${data.message ?? data.error ?? res.status}`,
      );
    }

    const resolvedShopId = shopId ?? String(data.shop_id ?? '');
    return {
      shopId: resolvedShopId,
      namaToko: `Toko Shopee ${resolvedShopId}`,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expire_in
        ? new Date(Date.now() + data.expire_in * 1000)
        : undefined,
    };
  }
}
