import { IsString, MaxLength, MinLength } from 'class-validator';

export class AskAssistantDto {
  @IsString()
  @MinLength(2)
  @MaxLength(1200)
  message: string;
}
