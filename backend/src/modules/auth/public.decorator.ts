import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Tandai route/controller supaya dilewati JwtAuthGuard global. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
