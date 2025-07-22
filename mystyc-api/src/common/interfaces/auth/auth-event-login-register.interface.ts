import { Device } from 'mystyc-common/schemas/';

export interface AuthEventLoginRegister {
  firebaseUid: string,
  device: Device
  clientTimestamp: string
}