import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Channel } from '../../common/channel.enum';
import { SYNC_QUEUE, SyncJobName } from './sync.constants';

const RETRY_OPTS = {
  attempts: 5,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: 100,
  removeOnFail: 1000,
} as const;

/**
 * Titik masuk untuk menjadwalkan pekerjaan sync. Dipakai oleh scheduler
 * (pull terjadwal tiap 5-15 menit) maupun dipicu manual lewat API.
 */
@Injectable()
export class SyncService {
  constructor(@InjectQueue(SYNC_QUEUE) private readonly queue: Queue) {}

  enqueuePullOrders(channel: Channel) {
    return this.queue.add(SyncJobName.PULL_ORDERS, { channel }, RETRY_OPTS);
  }

  enqueuePushStock(productId: string) {
    return this.queue.add(SyncJobName.PUSH_STOCK, { productId }, RETRY_OPTS);
  }
}
