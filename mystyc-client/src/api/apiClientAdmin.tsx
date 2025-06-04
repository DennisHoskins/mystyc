import { fetchApi } from './apiClient';
import { User, UserProfile, Device, AuthEvent, Notification } from '@/interfaces';

export const apiClientAdmin = {
  // User Management
  getUsers: (): Promise<UserProfile[]> =>
    fetchApi('/admin/users', { method: 'GET' }),

  getUser: (firebaseUid: string): Promise<User> =>
    fetchApi(`/admin/user/${firebaseUid}`, { method: 'GET' }),

  promoteAdmin: (firebaseUid: string): Promise<void> =>
    fetchApi(`/admin/user/${firebaseUid}/promote-admin`, { method: 'POST' }),

  revokeAdmin: (firebaseUid: string): Promise<void> =>
    fetchApi(`/admin/user/${firebaseUid}/revoke-admin`, { method: 'PATCH' }),

  revokeUserTokens: (firebaseUid: string): Promise<void> =>
    fetchApi(`/admin/user/${firebaseUid}/revoke-tokens`, { method: 'POST' }),

  // Device Management
  getDevices: (query?: Record<string, any>): Promise<Device[]> => {
    const params = query ? `?${new URLSearchParams(query).toString()}` : '';
    return fetchApi(`/admin/devices${params}`, { method: 'GET' });
  },

  getDevice: (deviceId: string): Promise<Device> =>
    fetchApi(`/admin/device/${deviceId}`, { method: 'GET' }),

  getUserDevices: (firebaseUid: string): Promise<any> =>
    fetchApi(`/admin/devices/${firebaseUid}`, { method: 'GET' }),

  // Auth Events Management
  getAuthEvents: (query?: Record<string, any>): Promise<AuthEvent[]> => {
    const params = query ? `?${new URLSearchParams(query).toString()}` : '';
    return fetchApi(`/admin/auth-events${params}`, { method: 'GET' });
  },

  getAuthEvent: (eventId: string): Promise<AuthEvent> =>
    fetchApi(`/admin/auth-event/${eventId}`, { method: 'GET' }),

  getUserAuthEvents: (
    firebaseUid: string,
    limit?: number,
    offset?: number
  ): Promise<AuthEvent[]> => {
    const params = new URLSearchParams();
    if (limit != null) params.append('limit', limit.toString());
    if (offset != null) params.append('offset', offset.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi(`/admin/auth-events/user/${firebaseUid}${query}`, { method: 'GET' });
  },

  getDeviceAuthEvents: (
    deviceId: string,
    limit?: number,
    offset?: number
  ): Promise<AuthEvent[]> => {
    const params = new URLSearchParams();
    if (limit != null) params.append('limit', limit.toString());
    if (offset != null) params.append('offset', offset.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi(`/admin/device/${deviceId}/auth-events${query}`, { method: 'GET' });
  },

  getAuthEventDevice: (eventId: string): Promise<Device> =>
    fetchApi(`/admin/auth-event/${eventId}/device`, { method: 'GET' }),

  // Notifications Management
  getNotifications: (query?: Record<string, any>): Promise<Notification[]> => {
    const params = query ? `?${new URLSearchParams(query).toString()}` : '';
    return fetchApi(`/admin/notifications${params}`, { method: 'GET' });
  },

  getNotification: (notificationId: string): Promise<Notification> =>
    fetchApi(`/admin/notification/${notificationId}`, { method: 'GET' }),

  sendTestNotification: (): Promise<void> =>
    fetchApi('/admin/notifications/test', { method: 'POST', body: {} }),

  sendUserNotification: (firebaseUid: string): Promise<void> =>
    fetchApi('/admin/notifications/send', {
      method: 'POST',
      body: {
        firebaseUid,
        title: 'Admin Notification',
        body: 'You have received a notification from an administrator',
      },
    }),

  sendDeviceNotification: (deviceId: string): Promise<void> =>
    fetchApi('/admin/notifications/send', {
      method: 'POST',
      body: {
        deviceId,
        title: 'Admin Notification',
        body: 'You have received a notification from an administrator',
      },
    }),
};
