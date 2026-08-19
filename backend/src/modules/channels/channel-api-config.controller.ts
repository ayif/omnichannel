import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Put,
} from '@nestjs/common';
import { Channel } from '../../common/channel.enum';
import { Role } from '../../common/role.enum';
import { AuditAction } from '../../database/entities/audit-log.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { ChannelApiConfigService } from './channel-api-config.service';
import { UpdateChannelApiConfigDto } from './dto/update-channel-api-config.dto';

/** Kredensial aplikasi (client_id/secret) per channel - hanya admin. */
@Controller('channel-api-configs')
@Roles(Role.ADMIN)
export class ChannelApiConfigController {
  constructor(
    private readonly service: ChannelApiConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  findAll() {
    return this.service.findAllMasked();
  }

  @Put(':channel')
  async upsert(
    @Param('channel', new ParseEnumPipe(Channel)) channel: Channel,
    @Body() dto: UpdateChannelApiConfigDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.service.upsert(channel, dto.values);
    await this.auditLogService.record({
      action: AuditAction.CHANNEL_API_CONFIG_UPDATE,
      user,
      entityType: 'channel_api_config',
      entityId: channel,
      description: `${user.nama} memperbarui konfigurasi API ${channel}`,
      metadata: { channel },
    });
    return result;
  }
}
