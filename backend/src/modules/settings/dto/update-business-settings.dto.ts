import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBusinessSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  namaBisnis?: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telepon?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
