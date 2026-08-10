import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AccountingController],
  providers: [AccountingService],
})
export class AccountingModule {}
