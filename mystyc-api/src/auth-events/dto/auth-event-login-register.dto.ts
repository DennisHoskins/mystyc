import { ValidateClientTimestamp } from '@/common/decorators/validation.decorators';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { DeviceDto } from '@/devices/dto/device.dto';

export class AuthEventLoginRegisterDto {
  @ValidateNested()
  @Type(() => DeviceDto)
  device: DeviceDto;

  @ValidateClientTimestamp()
  clientTimestamp: string;
}