import { Controller, Get, Query } from '@nestjs/common';
import { Channel } from '../../common/channel.enum';
import { Role } from '../../common/role.enum';
import { Roles } from '../auth/roles.decorator';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@Roles(Role.ADMIN, Role.STAFF)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('produk-terlaris')
  produkTerlaris(
    @Query('channel') channel?: Channel,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.analyticsService.produkTerlaris({
      channel,
      startDate,
      endDate,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('stok-tercepat-habis')
  stokTercepatHabis(@Query('lookbackDays') lookbackDays?: string, @Query('limit') limit?: string) {
    return this.analyticsService.stokTercepatHabis({
      lookbackDays: lookbackDays ? Number(lookbackDays) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
