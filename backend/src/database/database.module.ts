import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ChannelAccount,
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
];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
