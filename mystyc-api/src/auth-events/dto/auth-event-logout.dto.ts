import {
  ValidateDeviceId,
  ValidateClientTimestamp,
  ValidateFirebaseUid,
} from '@/common/decorators/validation.decorators';

export class AuthEventLogoutDto {
  @ValidateFirebaseUid()
  firebaseUid: string;

  @ValidateDeviceId()
  deviceId: string;

  @ValidateClientTimestamp()
  clientTimestamp: string;
}