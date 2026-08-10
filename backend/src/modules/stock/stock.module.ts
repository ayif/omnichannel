import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StockService } from './stock.service';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
