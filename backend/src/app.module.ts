import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { buildTypeOrmOptions } from './database/typeorm.config';
import { AccountingModule } from './modules/accounting/accounting.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProductsModule } from './modules/products/products.module';
import { SettingsModule } from './modules/settings/settings.module';
import { StockModule } from './modules/stock/stock.module';
import { SyncModule } from './modules/sync/sync.module';
import { SyncScheduler } from './modules/sync/sync.scheduler';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildTypeOrmOptions,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.get<string>('REDIS_URL') },
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    ChannelsModule,
    StockModule,
    SyncModule,
    ProductsModule,
    TransactionsModule,
    DashboardModule,
    AccountingModule,
    AuditLogModule,
    NotificationsModule,
    AnalyticsModule,
    AiAssistantModule,
    UsersModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SyncScheduler],
})
export class AppModule {}
