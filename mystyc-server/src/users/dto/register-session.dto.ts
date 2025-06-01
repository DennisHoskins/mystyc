import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { DeviceDto } from '@/devices/dto/device.dto';

// Create a class version for validation
class AuthEventDataDto {
  firebaseUid: string;
  deviceId: string;
  ip: string;
  platform: string;
  clientTimestamp: string;
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