import {
  ValidateDeviceId,
  ValidateFcmTokenRequired
} from '@/common/decorators/validation.decorators';

export class UpdateFcmTokenDto {
  @ValidateDeviceId()
  deviceId: string;

  @ValidateFcmTokenRequired()
  fcmToken: string;
}