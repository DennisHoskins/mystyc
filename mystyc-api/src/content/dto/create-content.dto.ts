import { IsOptional, IsString, IsISO8601 } from 'class-validator';

export class CreateContentDto {
  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsISO8601()
  clientTimestamp?: string;
}