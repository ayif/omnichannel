import {
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Channel } from '../../common/channel.enum';
import { Role } from '../../common/role.enum';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { ChannelAccountsService } from './channel-accounts.service';

@Controller('channel-accounts')
@Roles(Role.ADMIN, Role.STAFF)
export class ChannelAccountsController {
  constructor(private readonly channelAccountsService: ChannelAccountsService) {}

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
      res.redirect(`${frontendUrl}/sinkronisasi?connected=${account.channel}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menghubungkan toko';
      res.redirect(`${frontendUrl}/sinkronisasi?error=${encodeURIComponent(message)}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.channelAccountsService.remove(id);
    return { ok: true };
  }
}
