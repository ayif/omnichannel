import { Controller, Get, Param, ParseEnumPipe, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../../common/channel.enum';
import { Role } from '../../common/role.enum';
import { SyncLog, SyncStatus } from '../../database/entities/sync-log.entity';
import { Roles } from '../auth/roles.decorator';
import { SyncService } from './sync.service';

export interface SyncLogDto {
  id: string;
  channel: Channel;
  status: SyncStatus;
  waktuMulai: string;
  waktuSelesai: string | null;
  jumlahDataDitarik: number;
  errorMessage: string | null;
}

@Controller('sync-logs')
@Roles(Role.ADMIN, Role.STAFF)
export class SyncLogsController {
  constructor(
    @InjectRepository(SyncLog) private readonly syncLogRepo: Repository<SyncLog>,
    private readonly syncService: SyncService,
  ) {}

  @Get()
  async latestPerChannel(): Promise<SyncLogDto[]> {
    const channels = Object.values(Channel);
    const logs = await Promise.all(
      channels.map((channel) =>
        this.syncLogRepo.findOne({ where: { channel }, order: { waktuMulai: 'DESC' } }),
      ),
    );

    return logs.map((log, i) => {
      if (!log) {
        return {
          id: `no-log-${channels[i]}`,
          channel: channels[i],
          status: SyncStatus.FAILED,
          waktuMulai: new Date(0).toISOString(),
          waktuSelesai: null,
          jumlahDataDitarik: 0,
          errorMessage: 'Belum pernah sync',
        };
      }
      return {
        id: log.id,
        channel: log.channel,
        status: log.status,
        waktuMulai: log.waktuMulai.toISOString(),
        waktuSelesai: log.waktuSelesai ? log.waktuSelesai.toISOString() : null,
        jumlahDataDitarik: log.jumlahDataDitarik,
        errorMessage: log.errorMessage,
      };
    });
  }

  @Post(':channel/trigger')
  async trigger(@Param('channel', new ParseEnumPipe(Channel)) channel: Channel) {
    await this.syncService.enqueuePullOrders(channel);
    return { queued: true, channel };
  }
}
