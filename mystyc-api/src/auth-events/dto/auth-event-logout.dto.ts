import { IsString, ValidateNested, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';
import { DeviceDto } from '@/devices/dto/device.dto';

export class AuthEventLogoutDto {
  @IsString()
  firebaseUid!: string;

  @ValidateNested()
  @Type(() => DeviceDto)
  device!: DeviceDto;

  @IsISO8601()
  clientTimestamp!: string;
}
