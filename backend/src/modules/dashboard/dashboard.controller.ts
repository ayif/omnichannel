import { Controller, Get } from '@nestjs/common';
import { Role } from '../../common/role.enum';
import { Roles } from '../auth/roles.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@Roles(Role.ADMIN, Role.STAFF)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  stats() {
    return this.dashboardService.stats();
  }

  @Get('sales-trend')
  salesTrend() {
    return this.dashboardService.salesTrend();
  }

  @Get('channel-totals')
  channelTotals() {
    return this.dashboardService.channelTotals();
  }
}
