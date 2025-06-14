import {
  ValidateDeviceId,
  ValidateDeviceName,
  ValidateFcmTokenOptional,
  ValidatePlatform,
  ValidateTimezone,
  ValidateLanguageCode,
  ValidateUserAgent,
  ValidateAppVersion,
} from '@/common/decorators/validation.decorators';

export class DeviceDto {
  @ValidateDeviceId()
  deviceId: string;

  @ValidateDeviceName()
  deviceName: string;

  @ValidateFcmTokenOptional()
  fcmToken?: string;

  @ValidatePlatform()
  platform: string;

  @ValidateTimezone()
  timezone: string;

  @ValidateLanguageCode()
  language: string;

  @ValidateUserAgent()
  userAgent: string;

  @ValidateAppVersion()
  appVersion?: string;
}