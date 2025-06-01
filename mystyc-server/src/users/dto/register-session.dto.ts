import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { DeviceDto } from '@/devices/dto/device.dto';
import {
  ValidateDeviceId,
  ValidatePlatform,
  ValidateIpAddress,
  ValidateClientTimestamp,
  ValidateAuthEventType,
  ValidateFirebaseUid
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

export class RegisterSessionDto {
  @ValidateNested()
  @Type(() => DeviceDto)
  device: DeviceDto;

  @ValidateNested()
  @Type(() => AuthEventDto)
  authEvent: AuthEventDto;
}