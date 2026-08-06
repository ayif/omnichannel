import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { StockService } from './stock.service';

@Module({
  imports: [DatabaseModule],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
