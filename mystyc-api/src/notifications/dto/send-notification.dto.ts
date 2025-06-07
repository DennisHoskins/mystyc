import { IsOptional, IsString, IsBoolean, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

import {
  ValidateDeviceId,
  ValidateFirebaseUid
} from '@/common/decorators/validation.decorators';

export class SendNotificationDto {
  // Message content
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Body must be a string' })
  body?: string;

  // Target types - only one should be provided
  @IsOptional()
  @ValidateDeviceId()
  deviceId?: string;

  @IsOptional()
  @ValidateFirebaseUid()
  firebaseUid?: string;

  @IsOptional()
  @IsBoolean({ message: 'Broadcast must be a boolean' })
  @Transform(({ value }) => value === true || value === 'true')
  broadcast?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Test must be a boolean' })
  @Transform(({ value }) => value === true || value === 'true')
  test?: boolean;
}