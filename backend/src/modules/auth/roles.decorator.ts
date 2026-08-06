import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/role.enum';

export const ROLES_KEY = 'roles';

/** Batasi route/controller hanya untuk role tertentu. Tanpa decorator ini = semua role login boleh akses. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
