import {
  ValidateDeviceId,
  ValidateClientTimestamp,
} from '@/common/decorators/validation.decorators';

export class AuthEventLogoutDto {
  @ValidateDeviceId()
  deviceId: string;

  @ValidateClientTimestamp()
  clientTimestamp: string;
}