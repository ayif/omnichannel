import {
  Controller,
  Get,
  Header,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { Channel } from '../../common/channel.enum';
import { Role } from '../../common/role.enum';
import { Roles } from '../auth/roles.decorator';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@Roles(Role.ADMIN, Role.STAFF)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(@Query('channel') channel?: Channel, @Query('limit') limit?: string) {
    return this.transactionsService.findAll({
      channel,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('export')
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
    const buffer = await this.transactionsService.exportToExcel({
      channel,
      startDate,
      endDate,
    });
    const filename = `rekap-transaksi-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    return new StreamableFile(buffer);
  }
}
