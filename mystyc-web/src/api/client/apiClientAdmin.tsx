import { ClientRequestHandler } from './ClientRequestHandler';
import { AdminQuery, User, UserProfile, Device, AuthEvent, Notification } from '@/interfaces';

export const apiClientAdmin = {
  // User Management
  getUsers: (query?: AdminQuery): Promise<UserProfile[]> =>
    ClientRequestHandler.makeRequest<UserProfile[]>(
      '/api/server/admin',
      {
        method: 'GET',
        action: 'getAdminData',
        data: { endpoint: `users${query ? `?${new URLSearchParams(query as any).toString()}` : ''}` }
      }
    ),

  getUser: (firebaseUid: string): Promise<User> =>
    ClientRequestHandler.makeRequest<User>(
      '/api/server/admin',
      {
        method: 'GET',
        action: 'getAdminData',
        data: { endpoint: `user/${firebaseUid}` }
      }
    ),

  promoteAdmin: (firebaseUid: string): Promise<void> =>
    ClientRequestHandler.makeRequest<void>(
      '/api/server/admin',
      {
        method: 'POST',
        action: 'postAdminData',
        data: { endpoint: `user/${firebaseUid}/promote-admin` }
      }
    ),

  revokeAdmin: (firebaseUid: string): Promise<void> =>
    ClientRequestHandler.makeRequest<void>(
      '/api/server/admin',
      {
        method: 'PATCH',
        action: 'patchAdminData',
        data: { endpoint: `user/${firebaseUid}/revoke-admin` }
      }
    ),

  revokeUserTokens: (firebaseUid: string): Promise<void> =>
    ClientRequestHandler.makeRequest<void>(
      '/api/server/admin',
      {
        method: 'POST',
        action: 'postAdminData',
        data: { endpoint: `user/${firebaseUid}/revoke-tokens` }
      }
    ),

  // Device Management
  getDevices: (query?: AdminQuery): Promise<Device[]> =>
    ClientRequestHandler.makeRequest<Device[]>(
      '/api/server/admin',
      {
        method: 'GET',
        action: 'getAdminData',
        data: { endpoint: `devices${query ? `?${new URLSearchParams(query as any).toString()}` : ''}` }
      }
    ),

  getDevice: (deviceId: string): Promise<Device> =>
    ClientRequestHandler.makeRequest<Device>(
      '/api/server/admin',
      {
        method: 'GET',
        action: 'getAdminData',
        data: { endpoint: `device/${deviceId}` }
      }
    ),

  getUserDevices: (firebaseUid: string): Promise<any> =>
    ClientRequestHandler.makeRequest<any>(
      '/api/server/admin',
      {
        method: 'GET',
        action: 'getAdminData',
        data: { endpoint: `devices/${firebaseUid}` }
      }
    ),

  // Auth Events Management
  getAuthEvents: (query?: AdminQuery): Promise<AuthEvent[]> =>
    ClientRequestHandler.makeRequest<AuthEvent[]>(
      '/api/server/admin',
      {
        method: 'GET',
        action: 'getAdminData',
        data: { endpoint: `auth-events${query ? `?${new URLSearchParams(query as any).toString()}` : ''}` }
      }
    ),

  getAuthEvent: (eventId: string): Promise<AuthEvent> =>
    ClientRequestHandler.makeRequest<AuthEvent>(
      '/api/server/admin',
      {
        method: 'GET',
        action: 'getAdminData',
        data: { endpoint: `auth-event/${eventId}` }
      }
    ),

  getUserAuthEvents: (firebaseUid: string): Promise<AuthEvent[]> =>
    ClientRequestHandler.makeRequest<AuthEvent[]>(
      '/api/server/admin',
      {
        method: 'GET',
        action: 'getAdminData',
        data: { endpoint: `auth-events/user/${firebaseUid}` }
      }
    ),

  getDeviceAuthEvents: (deviceId: string): Promise<AuthEvent[]> =>
    ClientRequestHandler.makeRequest<AuthEvent[]>(
      '/api/server/admin',
      {
        method: 'GET',
        action: 'getAdminData',
        data: { endpoint: `device/${deviceId}/auth-events` }
      }
    ),

  getAuthEventDevice: (eventId: string): Promise<Device> =>
    ClientRequestHandler.makeRequest<Device>(
      '/api/server/admin',
      {
        method: 'GET',
        action: 'getAdminData',
        data: { endpoint: `auth-event/${eventId}/device` }
      }
    ),

  // Notifications Management
  getNotifications: (query?: AdminQuery): Promise<Notification[]> =>
    ClientRequestHandler.makeRequest<Notification[]>(
      '/api/server/admin',
      {
        method: 'GET',
        action: 'getAdminData',
        data: { endpoint: `notifications${query ? `?${new URLSearchParams(query as any).toString()}` : ''}` }
      }
    ),

  getNotification: (notificationId: string): Promise<Notification> =>
    ClientRequestHandler.makeRequest<Notification>(
      '/api/server/admin',
      {
        method: 'GET',
        action: 'getAdminData',
        data: { endpoint: `notification/${notificationId}` }
      }
    ),

  sendTestNotification: (deviceId: string): Promise<void> =>
    ClientRequestHandler.makeRequest<void>(
      '/api/server/admin',
      {
        method: 'POST',
        action: 'postAdminData',
        data: { endpoint: 'notifications/test', deviceId }
      }
    ),

  sendUserNotification: (firebaseUid: string): Promise<void> =>
    ClientRequestHandler.makeRequest<void>(
      '/api/server/admin',
      {
        method: 'POST',
        action: 'postAdminData',
        data: { 
          endpoint: 'notifications/send',
          firebaseUid,
          title: 'You Win!',
          body: 'You have received a notification!'
        }
      }
    ),

  sendDeviceNotification: (deviceId: string): Promise<void> =>
    ClientRequestHandler.makeRequest<void>(
      '/api/server/admin',
      {
        method: 'POST',
        action: 'postAdminData',
        data: { 
          endpoint: 'notifications/send',
          deviceId,
          title: 'You Win!',
          body: 'You have received a notification!'
        }
      }
    ),
};