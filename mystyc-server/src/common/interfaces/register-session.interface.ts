import { DeviceDto } from '@/devices/dto/device.dto';
import { AuthEventDto } from '@/auth-events/dto/auth-event.dto';

export interface RegisterSession {
  device: DeviceDto;
  authEvent: AuthEventDto;
}