import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { DeviceDto } from '@/devices/dto/device.dto';
import {
  ValidateFirebaseUid,
  ValidateDeviceId,
  ValidateIpAddress,
  ValidatePlatform,
  ValidateClientTimestamp,
  ValidateAuthEventType
} from '@/common/decorators/validation.decorators';

class AuthEventDataDto {
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

export class RegisterSessionDto {
  @ValidateNested()
  @Type(() => DeviceDto)
  device: DeviceDto;

  @ValidateNested()
  @Type(() => AuthEventDataDto)
  authEvent: AuthEventDataDto;
}