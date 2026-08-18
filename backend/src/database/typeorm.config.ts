import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
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

export function buildTypeOrmOptions(
  config: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    url: config.get<string>('DATABASE_URL'),
    entities: [
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
    ],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: config.get<string>('NODE_ENV') !== 'production',
    autoLoadEntities: true,
  };
}
