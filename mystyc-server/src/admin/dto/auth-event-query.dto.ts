import { IsOptional } from 'class-validator';
import {
  ValidateFirebaseUid,
  ValidateDeviceId,
  ValidateAuthEventType,
  ValidateDateRange,
  ValidateEndDate,
  ValidatePaginationLimit,
  ValidatePaginationOffset
} from '@/common/decorators/validation.decorators';

export class AuthEventQueryDto {
  @IsOptional()
  @ValidateFirebaseUid()
  firebaseUid?: string;

  @IsOptional()
  @ValidateDeviceId()
  deviceId?: string;

  @IsOptional()
  @ValidateAuthEventType()
  type?: 'login' | 'logout' | 'create';

  @ValidateDateRange('endDate')
  startDate?: string;

  @ValidateEndDate()
  endDate?: string;

  @ValidatePaginationLimit()
  limit?: number;

  @ValidatePaginationOffset()
  offset?: number;
}