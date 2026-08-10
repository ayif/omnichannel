import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuditAction } from '../../database/entities/audit-log.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import type { AuthenticatedUser } from './jwt.strategy';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    try {
      const result = await this.authService.login(dto.email, dto.password);
      await this.auditLogService.record({
        action: AuditAction.LOGIN_SUCCESS,
        user: result.user,
        entityType: 'auth',
        entityId: result.user.sub,
        description: `${result.user.nama} berhasil login`,
        ipAddress: req.ip,
      });
      return result;
    } catch (error) {
      await this.auditLogService.record({
        action: AuditAction.LOGIN_FAILED,
        user: null,
        entityType: 'auth',
        description: `Percobaan login gagal untuk ${dto.email}`,
        metadata: { email: dto.email },
        ipAddress: req.ip,
      });
      throw error;
    }
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
