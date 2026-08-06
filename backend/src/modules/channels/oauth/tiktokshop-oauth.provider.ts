import { createHmac } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ChannelOAuthProvider, OAuthTokenResult } from './oauth-provider.interface';

interface TikTokShopTokenResponse {
  data?: {
    access_token: string;
    refresh_token?: string;
    access_token_expire_in?: number;
    seller_name?: string;
    seller_base_region?: string;
  };
  shop_id?: string | number;
  code?: number;
  message?: string;
}

/**
 * Alur OAuth2 + signature HMAC-SHA256 (app_key/app_secret) untuk TikTok Shop
 * Partner Center API v2 - polanya mirip Shopee, tapi detail signature TikTok
 * Shop menyusun base string beda (app_secret dibungkus di awal & akhir string
 * yang di-sign, bukan cuma di key HMAC).
 *
 * PENTING: sama seperti tokopedia-oauth.provider.ts, URL & skema sign di bawah
 * ini adalah PLACEHOLDER - penulis modul ini tidak punya akses ke TikTok Shop
 * Partner Center Developer Portal buat memastikan endpoint & parameter persis
 * (apalagi TikTok Shop juga jadi jalur baru integrasi Tokopedia pasca merger,
 * lihat catatan di tokopedia-oauth.provider.ts). Sebelum dipakai produksi:
 * daftar app di https://partner.tiktokshop.com, salin authorize_url & token_url
 * resmi dari sana, lalu isi TIKTOKSHOP_AUTHORIZE_URL & TIKTOKSHOP_TOKEN_URL di
 * .env supaya tidak perlu ubah kode.
 */
@Injectable()
export class TikTokShopOAuthProvider implements ChannelOAuthProvider {
  constructor(private readonly config: ConfigService) {}

  private get appKey(): string {
    return this.config.get<string>('TIKTOKSHOP_APP_KEY') ?? '';
  }

  private get appSecret(): string {
    return this.config.get<string>('TIKTOKSHOP_APP_SECRET') ?? '';
  }

  private get authorizeUrl(): string {
    return this.config.get<string>('TIKTOKSHOP_AUTHORIZE_URL') ?? 'https://services.tiktokshop.com/open/authorize';
  }

  private get baseUrl(): string {
    return this.config.get<string>('TIKTOKSHOP_BASE_URL') ?? 'https://auth.tiktok-shops.com';
  }

  private get redirectUri(): string {
    const backendUrl = this.config.get<string>('BACKEND_PUBLIC_URL') ?? 'http://localhost:3000';
    return `${backendUrl}/channel-accounts/tiktokshop/callback`;
  }

  private sign(path: string, params: Record<string, string>): string {
    const sortedEntries = Object.keys(params)
      .sort()
      .map((key) => `${key}${params[key]}`)
      .join('');
    const baseString = `${this.appSecret}${path}${sortedEntries}${this.appSecret}`;
    return createHmac('sha256', this.appSecret).update(baseString).digest('hex');
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      app_key: this.appKey,
      redirect_uri: this.redirectUri,
      state,
    });
    return `${this.authorizeUrl}?${params.toString()}`;
  }

  async exchangeCode({ code }: { code: string }): Promise<OAuthTokenResult> {
    const path = '/api/v2/token/get';
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signParams = { app_key: this.appKey, timestamp, auth_code: code };
    const params = new URLSearchParams({
      ...signParams,
      grant_type: 'authorized_code',
      sign: this.sign(path, signParams),
    });

    const res = await fetch(`${this.baseUrl}${path}?${params.toString()}`, {
      method: 'GET',
    });

    const data = (await res.json()) as TikTokShopTokenResponse;
    if (!res.ok || (data.code && data.code !== 0) || !data.data) {
      throw new Error(`TikTok Shop token exchange gagal: ${data.message ?? res.status}`);
    }

    const shopId = String(data.shop_id ?? '');
    return {
      shopId,
      namaToko: data.data.seller_name ?? `Toko TikTok Shop ${shopId}`,
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token,
      expiresAt: data.data.access_token_expire_in
        ? new Date(Date.now() + data.data.access_token_expire_in * 1000)
        : undefined,
    };
  }
}
