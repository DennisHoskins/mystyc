import { DeviceInfo } from './device-info.interface';

export interface UserRequest {
  deviceInfo: DeviceInfo;
}

export type UserContentRequest = UserRequest;

export interface UpdateFcmTokenRequest extends UserRequest {
  fcmToken: string;
}

export interface StartSubscriptionRequest extends UserRequest {
  priceId: string;
}

export type BillingPortalRequest = UserRequest;
export type CancelSubscriptionRequest = UserRequest;