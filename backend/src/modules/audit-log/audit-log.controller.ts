import { Controller, Get, Query } from '@nestjs/common';
import { Role } from '../../common/role.enum';
import { AuditAction } from '../../database/entities/audit-log.entity';
import { Roles } from '../auth/roles.decorator';
import { AuditLogService } from './audit-log.service';

@Controller('audit-logs')
@Roles(Role.ADMIN)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(
    @Query('action') action?: AuditAction,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditLogService.findAll({ action, startDate, endDate });
  }
}
