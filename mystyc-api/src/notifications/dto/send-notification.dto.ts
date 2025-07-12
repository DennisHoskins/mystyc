import { IsOptional, IsString, IsBoolean, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

import {
  ValidateDeviceId,
} from '@/common/decorators/validation.decorators';

export class SendNotificationDto {
  // Target device
  @IsOptional()
  @ValidateDeviceId()
  deviceId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Broadcast must be a boolean' })
  @Transform(({ value }) => value === true || value === 'true')
  broadcast?: boolean;

  // Message content
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Body must be a string' })
  body?: string;
}