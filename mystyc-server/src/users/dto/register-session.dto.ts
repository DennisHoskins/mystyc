import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { DeviceDto } from '@/devices/dto/device.dto';
import { AuthEventDto } from '@/auth-events/dto/auth-event.dto';

export class RegisterSessionDto {
  @ValidateNested()
  @Type(() => DeviceDto)
  device: DeviceDto;

  @ValidateNested()
  @Type(() => AuthEventDto)
  authEvent: AuthEventDto;
}