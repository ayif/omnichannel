import { randomBytes } from 'crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../../common/channel.enum';
import { decryptSecret, encryptSecret } from '../../common/crypto.util';
import {
  ChannelAccount,
  ChannelAccountStatus,
} from '../../database/entities/channel-account.entity';
import type { ChannelOAuthProvider } from './oauth/oauth-provider.interface';
import { ShopeeOAuthProvider } from './oauth/shopee-oauth.provider';
import { TikTokShopOAuthProvider } from './oauth/tiktokshop-oauth.provider';
import { TokopediaOAuthProvider } from './oauth/tokopedia-oauth.provider';

export interface ChannelAccountDto {
  id: string;
  channel: Channel;
  shopId: string;
  namaToko: string;
  status: ChannelAccountStatus;
  expiresAt: string | null;
  createdAt: string;
}

@Injectable()
export class ChannelAccountsService {
  constructor(
    @InjectRepository(ChannelAccount)
    private readonly accountRepo: Repository<ChannelAccount>,
    private readonly tokopediaOAuth: TokopediaOAuthProvider,
    private readonly shopeeOAuth: ShopeeOAuthProvider,
    private readonly tiktokShopOAuth: TikTokShopOAuthProvider,
  ) {}

  private providerFor(channel: Channel): ChannelOAuthProvider {
    switch (channel) {
      case Channel.TOKOPEDIA:
        return this.tokopediaOAuth;
      case Channel.SHOPEE:
        return this.shopeeOAuth;
      case Channel.TIKTOKSHOP:
        return this.tiktokShopOAuth;
      default:
        throw new BadRequestException(`Channel "${channel}" tidak mendukung koneksi OAuth`);
    }
  }

  getAuthorizationUrl(channel: Channel): string {
    // State sederhana (anti-CSRF minimal) - untuk produksi idealnya disimpan
    // sebentar (cache/redis) dan diverifikasi persis saat callback.
    const state = randomBytes(16).toString('hex');
    return this.providerFor(channel).getAuthorizationUrl(state);
  }

  async handleCallback(channel: Channel, code: string, shopId?: string): Promise<ChannelAccount> {
    const result = await this.providerFor(channel).exchangeCode({ code, shopId });

    let account = await this.accountRepo.findOne({
      where: { channel, shopId: result.shopId },
    });
    if (!account) {
      account = this.accountRepo.create({ channel, shopId: result.shopId });
    }

    account.namaToko = result.namaToko;
    account.accessTokenEnc = encryptSecret(result.accessToken);
    account.refreshTokenEnc = result.refreshToken ? encryptSecret(result.refreshToken) : null;
    account.expiresAt = result.expiresAt ?? null;
    account.status = ChannelAccountStatus.CONNECTED;

    return this.accountRepo.save(account);
  }

  async findAll(): Promise<ChannelAccountDto[]> {
    const accounts = await this.accountRepo.find({ order: { createdAt: 'DESC' } });
    return accounts.map((a) => ({
      id: a.id,
      channel: a.channel,
      shopId: a.shopId,
      namaToko: a.namaToko,
      status: a.expiresAt && a.expiresAt < new Date() ? ChannelAccountStatus.EXPIRED : a.status,
      expiresAt: a.expiresAt?.toISOString() ?? null,
      createdAt: a.createdAt.toISOString(),
    }));
  }

  async findActiveByChannel(channel: Channel): Promise<ChannelAccount[]> {
    return this.accountRepo.find({
      where: { channel, status: ChannelAccountStatus.CONNECTED },
    });
  }

  decryptAccessToken(account: ChannelAccount): string {
    return decryptSecret(account.accessTokenEnc);
  }

  async remove(id: string): Promise<void> {
    await this.accountRepo.delete(id);
  }
}
