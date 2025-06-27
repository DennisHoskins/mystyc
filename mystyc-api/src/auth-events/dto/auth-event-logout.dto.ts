import {
  ValidateFirebaseUid,
  ValidateClientTimestamp,
} from '@/common/decorators/validation.decorators';
import { ValidateNested } from 'class-validator';
import { DeviceDto } from '@/devices/dto/device.dto';
import { Type } from 'class-transformer';

export class AuthEventLogoutDto {
  @ValidateFirebaseUid()
  firebaseUid: string;

  @ValidateNested()
  @Type(() => DeviceDto)
  device: DeviceDto;

  @ValidateClientTimestamp()
  clientTimestamp: string;
}