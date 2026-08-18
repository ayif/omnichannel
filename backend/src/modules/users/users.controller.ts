import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Role } from '../../common/role.enum';
import { AuditAction } from '../../database/entities/audit-log.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Patch('me')
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Patch('me/password')
  changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.sub, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthenticatedUser) {
    const created = await this.usersService.create(dto);
    await this.auditLogService.record({
      action: AuditAction.USER_CREATE,
      user,
      entityType: 'user',
      entityId: created.id,
      description: `${user.nama} menambahkan user ${created.nama} (${created.role})`,
      metadata: { nama: created.nama, email: created.email, role: created.role },
    });
    return created;
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const updated = await this.usersService.update(id, dto, user.sub);
    await this.auditLogService.record({
      action: AuditAction.USER_UPDATE,
      user,
      entityType: 'user',
      entityId: updated.id,
      description: `${user.nama} mengubah data user ${updated.nama}`,
      metadata: { nama: updated.nama, email: updated.email, role: updated.role },
    });
    return updated;
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const removed = await this.usersService.remove(id, user.sub);
    await this.auditLogService.record({
      action: AuditAction.USER_DELETE,
      user,
      entityType: 'user',
      entityId: removed.id,
      description: `${user.nama} menghapus user ${removed.nama} (${removed.email})`,
      metadata: { nama: removed.nama, email: removed.email, role: removed.role },
    });
    return { ok: true };
  }
}
