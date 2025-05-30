import {
  ValidateDeviceId,
  ValidatePlatform,
  ValidateIpAddress,
  ValidateClientTimestamp,
  ValidateAuthEventType
} from '@/common/decorators/validation.decorators';

export class AuthEventDto {
  @ValidateDeviceId()
  deviceId: string;

  @ValidateIpAddress()
  ip: string;

  @ValidatePlatform()
  platform: string;

  @ValidateClientTimestamp()
  clientTimestamp: string;

  @ValidateAuthEventType()
  type: 'login' | 'logout' | 'create';
}