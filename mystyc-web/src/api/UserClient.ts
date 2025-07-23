import { User, Device, Content } from 'mystyc-common/schemas/';
import { 
  UserRequest, 
  UserContentRequest, 
  UpdateFcmTokenRequest, 
  StartSubscriptionRequest, 
  BillingPortalRequest, 
  CancelSubscriptionRequest 
} from '@/interfaces/user-requests.interface';
import { serverRoot, getDeviceInfo } from './apiClient';
import { handleSessionError } from '@/util/sessionErrorHandler'; 

export class UserClient {

  async getUser(): Promise<User | null> {
    try {
      const requestBody: UserRequest = {
        deviceInfo: getDeviceInfo()
      };

      const response = await fetch(`${serverRoot}/mystyc/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data?.error) {
        await handleSessionError(data.error, 'getUser');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  async getUserContent(): Promise<Content | null> {
    try {
      const requestBody: UserContentRequest = {
        deviceInfo: getDeviceInfo()
      };

      const response = await fetch(`${serverRoot}/mystyc/users/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (data?.error) {
        await handleSessionError(data.error, 'getUserContent');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return data;
    } catch (err) {
      throw err;
    }
  }

  async updateFcmToken(deviceId: string, fcmToken: string): Promise<Device> {
    try {
      const requestBody: UpdateFcmTokenRequest = {
        deviceInfo: getDeviceInfo(),
        fcmToken
      };

      const response = await fetch(`${serverRoot}/mystyc/devices/[${deviceId}]/updateFcmToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (data?.error) {
        await handleSessionError(data.error, 'updateFcmToken');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return data;
    } catch (err) {
      throw err;
    }
  }

  async startSubscription(priceId: string): Promise<{sessionUrl: string}> {
    try {
      const requestBody: StartSubscriptionRequest = {
        deviceInfo: getDeviceInfo(),
        priceId
      };

      const response = await fetch(`${serverRoot}/mystyc/users/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data?.error) {
        await handleSessionError(data.error, 'startSubscription');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  async getCustomerBillingPortal(): Promise<{ portalUrl: string }> {
    try {
      const requestBody: BillingPortalRequest = {
        deviceInfo: getDeviceInfo()
      };

      const response = await fetch(`${serverRoot}/mystyc/users/billing-portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data?.error) {
        await handleSessionError(data.error, 'getCustomerBillingPortal');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    try {
      const requestBody: CancelSubscriptionRequest = {
        deviceInfo: getDeviceInfo()
      };

      const response = await fetch(`${serverRoot}/mystyc/users/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data?.error) {
        await handleSessionError(data.error, 'cancelSubscription');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return data;
    } catch (err) {
      throw err;
    }
  }
}