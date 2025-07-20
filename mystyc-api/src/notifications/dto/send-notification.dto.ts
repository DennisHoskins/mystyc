import { IsOptional, IsString, IsBoolean, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class SendNotificationDto {
  @IsOptional()
  @IsString()
  @Length(8, 64)
  deviceId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  broadcast?: boolean;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;
}