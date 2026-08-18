import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Role } from '../../common/role.enum';
import { Roles } from '../auth/roles.decorator';
import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('business')
  getBusiness() {
    return this.settingsService.getBusiness();
  }

  @Patch('business')
  @Roles(Role.ADMIN)
  updateBusiness(@Body() dto: UpdateBusinessSettingsDto) {
    return this.settingsService.updateBusiness(dto);
  }
}
