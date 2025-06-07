import { DeviceDto } from '@/devices/dto/device.dto';

export interface RegisterSession {
  device: DeviceDto;
  clientTimestamp: string;
}