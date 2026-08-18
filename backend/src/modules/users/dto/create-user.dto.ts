import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../../../common/role.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  nama: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;
}
