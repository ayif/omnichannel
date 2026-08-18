import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AuditLog,
  BusinessSettings,
  ChannelAccount,
  Notification,
  Product,
  ProductChannelMapping,
  Stock,
  StockMovement,
  SyncLog,
  Transaction,
  User,
} from './entities';

const entities = [
  Product,
  ProductChannelMapping,
  Stock,
  StockMovement,
  SyncLog,
  Transaction,
  User,
  ChannelAccount,
  AuditLog,
  Notification,
  BusinessSettings,
];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
