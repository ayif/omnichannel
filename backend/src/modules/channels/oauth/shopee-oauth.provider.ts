import { createHmac } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ChannelOAuthProvider, OAuthTokenResult } from './oauth-provider.interface';

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
  constructor(private readonly config: ConfigService) {}

  private get partnerId(): string {
    return this.config.get<string>('SHOPEE_PARTNER_ID') ?? '';
  }

  private get partnerKey(): string {
    return this.config.get<string>('SHOPEE_PARTNER_KEY') ?? '';
  }

  private get baseUrl(): string {
    return this.config.get<string>('SHOPEE_BASE_URL') ?? 'https://partner.shopeemobile.com';
  }

  private get redirectUri(): string {
    const backendUrl = this.config.get<string>('BACKEND_PUBLIC_URL') ?? 'http://localhost:3000';
    return `${backendUrl}/channel-accounts/shopee/callback`;
  }

  private sign(path: string, timestamp: number): string {
    const baseString = `${this.partnerId}${path}${timestamp}`;
    return createHmac('sha256', this.partnerKey).update(baseString).digest('hex');
  }

  getAuthorizationUrl(state: string): string {
    const path = '/api/v2/shop/auth_partner';
    const timestamp = Math.floor(Date.now() / 1000);
    const redirect = `${this.redirectUri}?state=${encodeURIComponent(state)}`;
    const params = new URLSearchParams({
      partner_id: this.partnerId,
      timestamp: String(timestamp),
      sign: this.sign(path, timestamp),
      redirect,
    });
    return `${this.baseUrl}${path}?${params.toString()}`;
  }

  async exchangeCode({ code, shopId }: { code: string; shopId?: string }): Promise<OAuthTokenResult> {
    const path = '/api/v2/auth/token/get';
    const timestamp = Math.floor(Date.now() / 1000);
    const params = new URLSearchParams({
      partner_id: this.partnerId,
      timestamp: String(timestamp),
      sign: this.sign(path, timestamp),
    });

    const res = await fetch(`${this.baseUrl}${path}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        shop_id: shopId ? Number(shopId) : undefined,
        partner_id: Number(this.partnerId),
      }),
    });

    const data = (await res.json()) as ShopeeTokenResponse;
    if (!res.ok || data.error) {
      throw new Error(`Shopee token exchange gagal: ${data.message ?? data.error ?? res.status}`);
    }

    const resolvedShopId = shopId ?? String(data.shop_id ?? '');
    return {
      shopId: resolvedShopId,
      namaToko: `Toko Shopee ${resolvedShopId}`,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expire_in ? new Date(Date.now() + data.expire_in * 1000) : undefined,
    };
  }
}
