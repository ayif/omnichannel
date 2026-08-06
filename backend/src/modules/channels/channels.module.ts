import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ChannelAccountsController } from './channel-accounts.controller';
import { ChannelAccountsService } from './channel-accounts.service';
import { ShopeeOAuthProvider } from './oauth/shopee-oauth.provider';
import { TikTokShopOAuthProvider } from './oauth/tiktokshop-oauth.provider';
import { TokopediaOAuthProvider } from './oauth/tokopedia-oauth.provider';
import { TokopediaService } from './tokopedia/tokopedia.service';
import { ShopeeService } from './shopee/shopee.service';
import { TikTokShopService } from './tiktokshop/tiktokshop.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ChannelAccountsController],
  providers: [
    TokopediaService,
    ShopeeService,
    TikTokShopService,
    TokopediaOAuthProvider,
    ShopeeOAuthProvider,
    TikTokShopOAuthProvider,
    ChannelAccountsService,
  ],
  exports: [TokopediaService, ShopeeService, TikTokShopService, ChannelAccountsService],
})
export class ChannelsModule {}
