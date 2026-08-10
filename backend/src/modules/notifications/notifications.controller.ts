import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Query('unreadOnly') unreadOnly?: string) {
    return this.notificationsService.findAll({ unreadOnly: unreadOnly === 'true' });
  }

  @Post(':id/read')
  async markRead(@Param('id') id: string) {
    await this.notificationsService.markRead(id);
    return { ok: true };
  }

  @Post('read-all')
  async markAllRead() {
    await this.notificationsService.markAllRead();
    return { ok: true };
  }
}
