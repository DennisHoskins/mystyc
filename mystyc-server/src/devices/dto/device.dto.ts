import { IsString, IsNotEmpty } from 'class-validator';

export class DeviceDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  @IsString()
  @IsNotEmpty()
  platform: string;
}
