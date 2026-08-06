import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../../common/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  nama: string;
  role: Role;
}

export type AuthenticatedUser = JwtPayload;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'dev-secret-jangan-dipakai-production',
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return payload;
  }
}
