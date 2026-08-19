import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel } from '../../../common/channel.enum';
import { ChannelApiConfigService } from '../channel-api-config.service';
import type {
  ChannelOAuthProvider,
  OAuthTokenResult,
} from './oauth-provider.interface';

interface TokopediaTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  shop_id?: string | number;
  fs_id?: string | number;
  shop_name?: string;
  error?: string;
  error_description?: string;
}

/**
 * Alur OAuth2 authorization-code GENERIK untuk Tokopedia Seller API.
 *
 * PENTING: URL authorize/token di bawah ini adalah PLACEHOLDER, bukan
 * endpoint resmi yang sudah diverifikasi - lanskap API partner Tokopedia
 * berubah signifikan setelah merger dengan TikTok Shop, dan penulis modul
 * ini tidak punya akses ke dokumentasi terkini untuk memastikan URL persis.
 * Sebelum dipakai produksi: login ke Tokopedia Developer Portal / Seller
 * API dashboard kamu, salin authorize_url & token_url yang tertera di sana,
 * lalu isi TOKOPEDIA_AUTHORIZE_URL & TOKOPEDIA_TOKEN_URL di .env supaya
 * tidak perlu ubah kode.
 */
@Injectable()
export class TokopediaOAuthProvider implements ChannelOAuthProvider {
  constructor(
    private readonly config: ConfigService,
    private readonly apiConfig: ChannelApiConfigService,
  ) {}

  /** Kredensial diisi lewat halaman Pengaturan (DB) - .env cuma fallback lama. */
  private async resolvedConfig() {
    const db = await this.apiConfig.getDecrypted(Channel.TOKOPEDIA);
    return {
      clientId:
        db.clientId || this.config.get<string>('TOKOPEDIA_CLIENT_ID') || '',
      clientSecret:
        db.clientSecret ||
        this.config.get<string>('TOKOPEDIA_CLIENT_SECRET') ||
        '',
      authorizeUrl:
        db.authorizeUrl ||
        this.config.get<string>('TOKOPEDIA_AUTHORIZE_URL') ||
        'https://accounts.tokopedia.com/oauth/authorize',
      tokenUrl:
        db.tokenUrl ||
        this.config.get<string>('TOKOPEDIA_TOKEN_URL') ||
        'https://fs.tokopedia.net/token',
    };
  }

  private get redirectUri(): string {
    const backendUrl =
      this.config.get<string>('BACKEND_PUBLIC_URL') ?? 'http://localhost:3000';
    return `${backendUrl}/channel-accounts/tokopedia/callback`;
  }

  async getAuthorizationUrl(state: string): Promise<string> {
    const { clientId, authorizeUrl } = await this.resolvedConfig();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state,
    });
    return `${authorizeUrl}?${params.toString()}`;
  }

  async exchangeCode({ code }: { code: string }): Promise<OAuthTokenResult> {
    const { clientId, clientSecret, tokenUrl } = await this.resolvedConfig();
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    const data = (await res.json()) as TokopediaTokenResponse;
    if (!res.ok || data.error) {
      throw new Error(
        `Tokopedia token exchange gagal: ${data.error_description ?? data.error ?? res.status}`,
      );
    }

    const shopId = String(data.shop_id ?? data.fs_id ?? '');
    return {
      shopId,
      namaToko: data.shop_name ?? `Toko Tokopedia ${shopId}`,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
    };
  }
}
