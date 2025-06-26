import {
  ValidateFirebaseUid,
  ValidateDeviceId,
  ValidateFcmTokenRequired,
} from '@/common/decorators/validation.decorators';

export class UpdateFcmTokenDto {
  @ValidateFirebaseUid()
  firebaseUid: string;

  @ValidateDeviceId()
  deviceId: string;

  @ValidateFcmTokenRequired()
  fcmToken: string;
}