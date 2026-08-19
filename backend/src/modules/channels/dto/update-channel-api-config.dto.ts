import { IsObject } from 'class-validator';

export class UpdateChannelApiConfigDto {
  @IsObject()
  values: Record<string, string>;
}
