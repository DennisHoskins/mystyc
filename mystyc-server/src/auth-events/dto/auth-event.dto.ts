import {
  ValidateFirebaseUid,
  ValidateDeviceId,
  ValidateIpAddress,
  ValidatePlatform,
  ValidateClientTimestamp,
  ValidateAuthEventType
} from '@/common/decorators/validation.decorators';

export class AuthEventDto {
  @ValidateFirebaseUid()
  firebaseUid: string;

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