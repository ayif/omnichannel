import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Channel } from '../../common/channel.enum';
import { SyncService } from './sync.service';

/**
 * Pull terjadwal tiap 10 menit untuk Tokopedia, Shopee & TikTok Shop. Website
 * sendiri disinkron lewat webhook, jadi tidak perlu di-poll di sini.
 */
@Injectable()
export class SyncScheduler {
  constructor(private readonly syncService: SyncService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async pullMarketplaceOrders() {
    await Promise.all([
      this.syncService.enqueuePullOrders(Channel.TOKOPEDIA),
      this.syncService.enqueuePullOrders(Channel.SHOPEE),
      this.syncService.enqueuePullOrders(Channel.TIKTOKSHOP),
    ]);
  }
}
