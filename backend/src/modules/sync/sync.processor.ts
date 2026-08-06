import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { QueryFailedError, Repository } from 'typeorm';
import { Channel } from '../../common/channel.enum';
import { ProductChannelMapping } from '../../database/entities/product-channel-mapping.entity';
import { StockMovementSource } from '../../database/entities/stock-movement.entity';
import { SyncLog, SyncStatus } from '../../database/entities/sync-log.entity';
import { Transaction } from '../../database/entities/transaction.entity';
import { ChannelAccountsService } from '../channels/channel-accounts.service';
import { ShopeeService } from '../channels/shopee/shopee.service';
import { TikTokShopService } from '../channels/tiktokshop/tiktokshop.service';
import { TokopediaService } from '../channels/tokopedia/tokopedia.service';
import { StockService } from '../stock/stock.service';
import { SYNC_QUEUE, SyncJobName } from './sync.constants';
import { SyncService } from './sync.service';

const POSTGRES_UNIQUE_VIOLATION = '23505';

@Processor(SYNC_QUEUE)
export class SyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(
    private readonly tokopedia: TokopediaService,
    private readonly shopee: ShopeeService,
    private readonly tiktokShop: TikTokShopService,
    private readonly stockService: StockService,
    private readonly syncService: SyncService,
    private readonly channelAccountsService: ChannelAccountsService,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(ProductChannelMapping)
    private readonly mappingRepo: Repository<ProductChannelMapping>,
    @InjectRepository(SyncLog)
    private readonly syncLogRepo: Repository<SyncLog>,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case SyncJobName.PULL_ORDERS:
        return this.handlePullOrders(job.data.channel as Channel);
      case SyncJobName.PUSH_STOCK:
        return this.handlePushStock(job.data.productId as string);
      default:
        this.logger.warn(`Job tidak dikenal: ${job.name}`);
    }
  }

  private channelService(channel: Channel) {
    switch (channel) {
      case Channel.TOKOPEDIA:
        return this.tokopedia;
      case Channel.SHOPEE:
        return this.shopee;
      case Channel.TIKTOKSHOP:
        return this.tiktokShop;
      default:
        throw new Error(`Channel "${channel}" tidak punya integrasi marketplace (pull/push)`);
    }
  }

  private async handlePullOrders(channel: Channel) {
    const log = await this.syncLogRepo.save(
      this.syncLogRepo.create({ channel, status: SyncStatus.RUNNING, waktuMulai: new Date() }),
    );

    try {
      const accounts = await this.channelAccountsService.findActiveByChannel(channel);
      if (accounts.length === 0) {
        this.logger.warn(`Tidak ada toko ${channel} yang terhubung, sync dilewati`);
        await this.syncLogRepo.update(log.id, {
          status: SyncStatus.SUCCESS,
          waktuSelesai: new Date(),
          jumlahDataDitarik: 0,
        });
        return;
      }

      let jumlahDitarik = 0;

      // Multi-toko: tiap akun yang terhubung ditarik order-nya secara terpisah.
      for (const account of accounts) {
        const accessToken = this.channelAccountsService.decryptAccessToken(account);
        const orders = await this.channelService(channel).fetchNewOrders(account.shopId, accessToken);

        for (const order of orders) {
          const mapping = await this.mappingRepo.findOne({
            where: { channel, channelProductId: order.channelProductId },
          });
          if (!mapping) {
            this.logger.warn(
              `Tidak ada product_channel_mapping untuk ${channel}/${order.channelProductId}, order dilewati`,
            );
            continue;
          }

          const inserted = await this.insertTransactionIfNew(channel, mapping.productId, order);
          if (!inserted) continue;

          jumlahDitarik += 1;

          // Idempotent: hanya kurangi stok kalau transaksi ini baru pertama kali masuk.
          await this.stockService.applyMovement(
            mapping.productId,
            -order.qty,
            StockMovementSource.TRANSAKSI,
          );
          await this.syncService.enqueuePushStock(mapping.productId);
        }
      }

      await this.syncLogRepo.update(log.id, {
        status: SyncStatus.SUCCESS,
        waktuSelesai: new Date(),
        jumlahDataDitarik: jumlahDitarik,
      });
    } catch (error) {
      await this.syncLogRepo.update(log.id, {
        status: SyncStatus.FAILED,
        waktuSelesai: new Date(),
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async insertTransactionIfNew(
    channel: Channel,
    productId: string,
    order: Awaited<ReturnType<TokopediaService['fetchNewOrders']>>[number],
  ): Promise<boolean> {
    try {
      const transaction = this.transactionRepo.create({
        channel,
        channelOrderId: order.channelOrderId,
        productId,
        qty: order.qty,
        hargaJual: order.hargaJual,
        ongkosKirim: order.ongkosKirim,
        status: order.status as Transaction['status'],
        tanggalTransaksi: order.tanggalTransaksi,
        rawPayload: order.rawPayload,
      });
      await this.transactionRepo.insert(transaction);
      return true;
    } catch (error) {
      if (error instanceof QueryFailedError && (error.driverError as { code?: string })?.code === POSTGRES_UNIQUE_VIOLATION) {
        // channel_order_id sudah pernah disimpan - job ini retry, jangan dobel proses.
        return false;
      }
      throw error;
    }
  }

  private async handlePushStock(productId: string) {
    const mappings = await this.mappingRepo.find({ where: { productId } });
    const jumlahStok = await this.stockService.getCurrentStock(productId);

    await Promise.all(
      mappings.map(async (mapping) => {
        const accounts = await this.channelAccountsService.findActiveByChannel(mapping.channel);
        // TODO: kalau ada >1 toko per channel, product_channel_mapping perlu
        // discope per shopId supaya push stock ke toko yang tepat - untuk
        // sekarang dorong ke toko pertama yang terhubung.
        const account = accounts[0];
        if (!account) {
          this.logger.warn(`Tidak ada toko ${mapping.channel} yang terhubung, push stock dilewati`);
          return;
        }

        const accessToken = this.channelAccountsService.decryptAccessToken(account);
        await this.channelService(mapping.channel).updateStock(
          account.shopId,
          accessToken,
          mapping.channelProductId,
          jumlahStok,
        );
      }),
    );
  }
}
