import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseEnumPipe,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Channel } from '../../common/channel.enum';
import { Role } from '../../common/role.enum';
import { AuditAction } from '../../database/entities/audit-log.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { ChannelAccountsService } from './channel-accounts.service';

@Controller('channel-accounts')
@Roles(Role.ADMIN, Role.STAFF)
export class ChannelAccountsController {
  constructor(
    private readonly channelAccountsService: ChannelAccountsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  findAll() {
    return this.channelAccountsService.findAll();
  }

  @Get(':channel/connect')
  connect(@Param('channel', new ParseEnumPipe(Channel)) channel: Channel) {
    return { url: this.channelAccountsService.getAuthorizationUrl(channel) };
  }

  /**
   * Browser diarahkan ke sini LANGSUNG oleh Tokopedia/Shopee setelah pemilik
   * toko klik "izinkan" - tidak membawa Authorization header kita, makanya
   * endpoint ini public. Hasil akhirnya redirect balik ke halaman frontend.
   */
  @Public()
  @Get(':channel/callback')
  async callback(
    @Param('channel', new ParseEnumPipe(Channel)) channel: Channel,
    @Query('code') code: string,
    @Query('shop_id') shopId: string | undefined,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_PUBLIC_URL ?? 'http://localhost:3001';
    try {
      const account = await this.channelAccountsService.handleCallback(channel, code, shopId);
      await this.auditLogService.record({
        action: AuditAction.CHANNEL_CONNECT,
        user: null,
        entityType: 'channel_account',
        entityId: account.id,
        description: `Toko ${account.namaToko} (${channel}) terhubung`,
        metadata: { channel, namaToko: account.namaToko },
      });
      res.redirect(`${frontendUrl}/sinkronisasi?connected=${account.channel}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menghubungkan toko';
      res.redirect(`${frontendUrl}/sinkronisasi?error=${encodeURIComponent(message)}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const account = await this.channelAccountsService.findOne(id);
    if (!account) {
      throw new NotFoundException(`Channel account ${id} tidak ditemukan`);
    }
    await this.channelAccountsService.remove(id);
    await this.auditLogService.record({
      action: AuditAction.CHANNEL_DISCONNECT,
      user,
      entityType: 'channel_account',
      entityId: id,
      description: `${user.nama} memutuskan toko ${account.namaToko} (${account.channel})`,
      metadata: { channel: account.channel, namaToko: account.namaToko },
    });
    return { ok: true };
  }
}
