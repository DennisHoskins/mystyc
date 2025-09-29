import { DeviceInfo } from "./device-info.interface";

export interface AuthLoginRequest {
  email: string;
  password: string;
  deviceInfo: DeviceInfo;
  clientTimestamp: string;
}

export type AuthRegisterRequest = AuthLoginRequest;

export interface AuthLogoutRequest {
  deviceInfo: DeviceInfo;
  clientTimestamp: string;
}

export interface AuthResetPasswordRequest {
  email: string;
}