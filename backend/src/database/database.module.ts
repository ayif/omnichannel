import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AuditLog,
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
];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
