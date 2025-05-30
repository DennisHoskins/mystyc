import { IsOptional } from 'class-validator';
import {
  ValidateFirebaseUid,
  ValidatePlatform,
  ValidatePaginationLimit,
  ValidatePaginationOffset
} from '@/common/decorators/validation.decorators';

export class DeviceQueryDto {
  @IsOptional()
  @ValidateFirebaseUid()
  firebaseUid?: string;

  @IsOptional()
  @ValidatePlatform()
  platform?: string;

  @ValidatePaginationLimit()
  limit?: number;

  @ValidatePaginationOffset()
  offset?: number;
}