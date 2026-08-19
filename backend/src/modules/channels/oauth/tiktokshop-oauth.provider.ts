import { createHmac } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel } from '../../../common/channel.enum';
import { ChannelApiConfigService } from '../channel-api-config.service';
import type {
  ChannelOAuthProvider,
  OAuthTokenResult,
} from './oauth-provider.interface';

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
  constructor(
    private readonly config: ConfigService,
    private readonly apiConfig: ChannelApiConfigService,
  ) {}

  /** Kredensial diisi lewat halaman Pengaturan (DB) - .env cuma fallback lama. */
  private async resolvedConfig() {
    const db = await this.apiConfig.getDecrypted(Channel.TIKTOKSHOP);
    return {
      appKey: db.appKey || this.config.get<string>('TIKTOKSHOP_APP_KEY') || '',
      appSecret:
        db.appSecret || this.config.get<string>('TIKTOKSHOP_APP_SECRET') || '',
      authorizeUrl:
        db.authorizeUrl ||
        this.config.get<string>('TIKTOKSHOP_AUTHORIZE_URL') ||
        'https://services.tiktokshop.com/open/authorize',
      baseUrl:
        db.baseUrl ||
        this.config.get<string>('TIKTOKSHOP_BASE_URL') ||
        'https://auth.tiktok-shops.com',
    };
  }

  private get redirectUri(): string {
    const backendUrl =
      this.config.get<string>('BACKEND_PUBLIC_URL') ?? 'http://localhost:3000';
    return `${backendUrl}/channel-accounts/tiktokshop/callback`;
  }

  private sign(
    appSecret: string,
    path: string,
    params: Record<string, string>,
  ): string {
    const sortedEntries = Object.keys(params)
      .sort()
      .map((key) => `${key}${params[key]}`)
      .join('');
    const baseString = `${appSecret}${path}${sortedEntries}${appSecret}`;
    return createHmac('sha256', appSecret).update(baseString).digest('hex');
  }

  async getAuthorizationUrl(state: string): Promise<string> {
    const { appKey, authorizeUrl } = await this.resolvedConfig();
    const params = new URLSearchParams({
      app_key: appKey,
      redirect_uri: this.redirectUri,
      state,
    });
    return `${authorizeUrl}?${params.toString()}`;
  }

  async exchangeCode({ code }: { code: string }): Promise<OAuthTokenResult> {
    const { appKey, appSecret, baseUrl } = await this.resolvedConfig();
    const path = '/api/v2/token/get';
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signParams = { app_key: appKey, timestamp, auth_code: code };
    const params = new URLSearchParams({
      ...signParams,
      grant_type: 'authorized_code',
      sign: this.sign(appSecret, path, signParams),
    });

    const res = await fetch(`${baseUrl}${path}?${params.toString()}`, {
      method: 'GET',
    });

    const data = (await res.json()) as TikTokShopTokenResponse;
    if (!res.ok || (data.code && data.code !== 0) || !data.data) {
      throw new Error(
        `TikTok Shop token exchange gagal: ${data.message ?? res.status}`,
      );
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
