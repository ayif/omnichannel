import { Controller, Get, Header, Query, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { Channel } from '../../common/channel.enum';
import { Role } from '../../common/role.enum';
import { Roles } from '../auth/roles.decorator';
import { AccountingService } from './accounting.service';

@Controller('accounting')
@Roles(Role.ADMIN, Role.STAFF)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('laba-rugi')
  labaRugi(
    @Query('channel') channel?: Channel,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.labaRugi({ channel, startDate, endDate });
  }

  @Get('laba-rugi/export')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async export(
    @Res({ passthrough: true }) res: Response,
    @Query('channel') channel?: Channel,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<StreamableFile> {
    const buffer = await this.accountingService.exportToExcel({ channel, startDate, endDate });
    const filename = `laporan-laba-rugi-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    return new StreamableFile(buffer);
  }

  @Get('laba-rugi/export-pdf')
  @Header('Content-Type', 'application/pdf')
  async exportPdf(
    @Res({ passthrough: true }) res: Response,
    @Query('channel') channel?: Channel,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<StreamableFile> {
    const buffer = await this.accountingService.exportToPdf({ channel, startDate, endDate });
    const filename = `laporan-laba-rugi-${new Date().toISOString().slice(0, 10)}.pdf`;
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    return new StreamableFile(buffer);
  }
}
