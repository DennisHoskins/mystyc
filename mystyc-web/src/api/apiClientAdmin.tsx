import { fetchApi } from './apiClient';
import { AdminQuery, User, UserProfile, Device, AuthEvent, Notification } from '@/interfaces';

const buildQueryParams = (query: AdminQuery): string => {
 const params = new URLSearchParams();
 
 if (query.limit !== undefined) params.append('limit', query.limit.toString());
 if (query.offset !== undefined) params.append('offset', query.offset.toString());
 if (query.sortBy) params.append('sortBy', query.sortBy);
 if (query.sortOrder) params.append('sortOrder', query.sortOrder);
 
 const paramString = params.toString();
 return paramString ? `?${paramString}` : '';
};

export const apiClientAdmin = {
  // User Management
  getUsers: (
    authToken: string,
    query?: AdminQuery,
  ): Promise<UserProfile[]> => {
    const queryString = query ? buildQueryParams(query) : '';
    return fetchApi(
      authToken, 
      `/admin/users${queryString}`, 
      { method: 'GET' }
    )
  },

  getUser: (
    authToken: string,
    firebaseUid: string
  ): Promise<User> =>
    fetchApi(
      authToken, 
      `/admin/user/${firebaseUid}`, 
      { method: 'GET' }
    ),

  promoteAdmin: (
    authToken: string,
    firebaseUid: string
  ): Promise<void> =>
    fetchApi(authToken, 
      `/admin/user/${firebaseUid}/promote-admin`, 
      { method: 'POST' }
    ),

  revokeAdmin: (
    authToken: string,
    firebaseUid: string
  ): Promise<void> =>
    fetchApi(
      authToken, 
      `/admin/user/${firebaseUid}/revoke-admin`, 
      { method: 'PATCH' }
    ),

  revokeUserTokens: (
    authToken: string,
    firebaseUid: string
  ): Promise<void> =>
    fetchApi(
      authToken, 
      `/admin/user/${firebaseUid}/revoke-tokens`, 
      { method: 'POST' }
    ),

  // Device Management
  getDevices: (
    authToken: string,
    query?: AdminQuery,
  ): Promise<Device[]> => {
    const queryString = query ? buildQueryParams(query) : '';
    return fetchApi(
      authToken, 
      `/admin/devices${queryString}`, 
      { method: 'GET' }
    );
  },

  getDevice: (
    authToken: string,
    deviceId: string
  ): Promise<Device> =>
    fetchApi(
      authToken, 
      `/admin/device/${deviceId}`, 
      { method: 'GET' }
    ),

  getUserDevices: (
    authToken: string,
    firebaseUid: string
  ): Promise<any> =>
    fetchApi(
      authToken, 
      `/admin/devices/${firebaseUid}`, 
      { method: 'GET' }
    ),

  // Auth Events Management
  getAuthEvents: (
    authToken: string,
    query?: AdminQuery,
  ): Promise<AuthEvent[]> => {
    const queryString = query ? buildQueryParams(query) : '';
    return fetchApi(
      authToken, 
      `/admin/auth-events${queryString}`, 
      { method: 'GET' }
    );
  },

  getAuthEvent: (
    authToken: string,
    eventId: string
  ): Promise<AuthEvent> =>
    fetchApi(
      authToken, 
      `/admin/auth-event/${eventId}`, 
      { method: 'GET' }
    ),

  getUserAuthEvents: (
    authToken: string, 
    firebaseUid: string,
  ): Promise<AuthEvent[]> => {
    return fetchApi(
      authToken, 
      `/admin/auth-events/user/${firebaseUid}`, 
      { method: 'GET' });
  },

  getDeviceAuthEvents: (
    authToken: string, 
    deviceId: string,
  ): Promise<AuthEvent[]> => {
    return fetchApi(
      authToken, 
      `/admin/device/${deviceId}/auth-events`, 
      { method: 'GET' }
    );
  },

  getAuthEventDevice: (
    authToken: string,
    eventId: string
  ): Promise<Device> =>
    fetchApi(
      authToken, 
      `/admin/auth-event/${eventId}/device`, 
      { method: 'GET' }
    ),

  // Notifications Management
  getNotifications: (
    authToken: string,
    query?: AdminQuery,
  ): Promise<Notification[]> => {
    const queryString = query ? buildQueryParams(query) : '';
    return fetchApi(
      authToken, 
      `/admin/notifications${queryString}`, 
      { method: 'GET' }
    );
  },

  getNotification: (
    authToken: string,
    notificationId: string
  ): Promise<Notification> =>
    fetchApi(
      authToken, 
      `/admin/notification/${notificationId}`, 
      { method: 'GET' }
    ),

  sendTestNotification: (
    authToken: string,
    deviceId: string
  ): Promise<void> =>
    fetchApi(
      authToken, 
      '/admin/notifications/test', 
      { 
        method: 'POST', 
        body: {
          deviceId,
        } 
      }
    ),

  sendUserNotification: (
    authToken: string,
    firebaseUid: string
  ): Promise<void> =>
    fetchApi(
      authToken,
      '/admin/notifications/send',
      {
        method: 'POST',
        body: {
          firebaseUid,
          title: 'You Win!',
          body: 'You have received a notification!',
        },
      }
    ),

  sendDeviceNotification: (
    authToken: string,
    deviceId: string
  ): Promise<void> =>
    fetchApi(
      authToken,
      '/admin/notifications/send', 
      {
        method: 'POST',
        body: {
          deviceId,
          title: 'You Win!',
          body: 'You have received a notification!',
        },
      }
    ),
};
