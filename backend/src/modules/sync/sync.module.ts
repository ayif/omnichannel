import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { SYNC_QUEUE } from './sync.constants';
import { SyncLogsController } from './sync-logs.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [BullModule.registerQueue({ name: SYNC_QUEUE }), DatabaseModule, AuditLogModule],
  controllers: [SyncLogsController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
