import { Device } from 'mystyc-common';

export interface AuthEventLoginRegister {
  firebaseUid: string,
  device: Device
  clientTimestamp: string
}