import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ChannelAccountsController } from './channel-accounts.controller';
import { ChannelAccountsService } from './channel-accounts.service';
import { ChannelApiConfigController } from './channel-api-config.controller';
import { ChannelApiConfigService } from './channel-api-config.service';
import { ShopeeOAuthProvider } from './oauth/shopee-oauth.provider';
import { TikTokShopOAuthProvider } from './oauth/tiktokshop-oauth.provider';
import { TokopediaOAuthProvider } from './oauth/tokopedia-oauth.provider';
import { TokopediaService } from './tokopedia/tokopedia.service';
import { ShopeeService } from './shopee/shopee.service';
import { TikTokShopService } from './tiktokshop/tiktokshop.service';

@Module({
  imports: [DatabaseModule, AuditLogModule],
  controllers: [ChannelAccountsController, ChannelApiConfigController],
  providers: [
    TokopediaService,
    ShopeeService,
    TikTokShopService,
    ChannelApiConfigService,
    TokopediaOAuthProvider,
    ShopeeOAuthProvider,
    TikTokShopOAuthProvider,
    ChannelAccountsService,
  ],
  exports: [
    TokopediaService,
    ShopeeService,
    TikTokShopService,
    ChannelAccountsService,
  ],
})
export class ChannelsModule {}
