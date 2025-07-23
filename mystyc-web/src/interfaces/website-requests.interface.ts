import { DeviceInfo } from './device-info.interface';

export interface ContentRequest {
  deviceInfo: DeviceInfo;
}

export interface RegisterVisitRequest {
  deviceInfo: DeviceInfo;
  pathname: string;
  clientTimestamp: string;
}