import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  Logger.log('Sync worker berjalan, menunggu job dari queue "sync"...', 'Worker');
  app.enableShutdownHooks();
}
bootstrap();
