import { AdminQuery, Session, User, UserProfile, Device, AuthEvent, Notification } from '@/interfaces';
import { logger }  from '@/util/logger';

export const apiClientAdmin = {
  //
  // Auth Cache
  //
  getSessions: (query?: AdminQuery): Promise<Session[]> => {
    logger.log('getSession called', { query });
    return Promise.resolve([])
  },

  //
  // User Management
  //
  getUsers: (query?: AdminQuery): Promise<UserProfile[]> => {
    logger.log('getUsers called', { query });
    return Promise.resolve([])
  },

  getUser: (firebaseUid: string): Promise<User> => {
    logger.log('getUser called', { firebaseUid });
    return Promise.resolve({} as User)
  },

  promoteAdmin: (firebaseUid: string): Promise<void> => {
    logger.log('promoteAdmin called', { firebaseUid });
    return Promise.resolve()
  },

  revokeAdmin: (firebaseUid: string): Promise<void> => {
    logger.log('revokeAdmin called', { firebaseUid });
    return Promise.resolve()
  },

  revokeUserTokens: (firebaseUid: string): Promise<void> => {
    logger.log('revokeUserTokens called', { firebaseUid });
    return Promise.resolve()
  },

  //
  // Device Management
  //
  getDevices: (query?: AdminQuery): Promise<Device[]> => {
    logger.log('getDevices called', { query });
    return Promise.resolve([])
  },

  getDevice: (deviceId: string): Promise<Device> => {
    logger.log('getDevice called', { deviceId });
    return Promise.resolve({} as Device)
  },

  // todo
  getDeviceUsers: (deviceId: string): Promise<User[]> => {
    logger.log('getDevice called', { deviceId });
    return Promise.resolve([])
  },

  getUserDevices: (firebaseUid: string): Promise<any> => {
    logger.log('getUserDevices called', { firebaseUid });
    return Promise.resolve([])
  },

  //
  // Auth Events Management
  //
  getAuthEvents: (query?: AdminQuery): Promise<AuthEvent[]> => {
    logger.log('getAuthEvents called', { query });
    return Promise.resolve([])
  },

  getAuthEvent: (eventId: string): Promise<AuthEvent> => {
    logger.log('getAuthEvent called', { eventId });
    return Promise.resolve({} as AuthEvent)
  },

  getUserAuthEvents: (firebaseUid: string): Promise<AuthEvent[]> => {
    logger.log('getUserAuthEvents called', { firebaseUid });
    return Promise.resolve([])
  },

  getDeviceAuthEvents: (deviceId: string): Promise<AuthEvent[]> => {
    logger.log('getDeviceAuthEvents called', { deviceId });
    return Promise.resolve([])
  },

  getAuthEventDevice: (eventId: string): Promise<Device> => {
    logger.log('getAuthEventDevice called', { eventId });
    return Promise.resolve({} as Device)
  },

  //
  // Notifications Management
  //
  getNotifications: (query?: AdminQuery): Promise<Notification[]> => {
    logger.log('getNotifications called', { query });
    return Promise.resolve([])
  },

  getNotification: (notificationId: string): Promise<Notification> => {
    logger.log('getNotification called', { notificationId });
    return Promise.resolve({} as Notification)
  },

  sendTestNotification: (deviceId: string): Promise<void> => {
    logger.log('sendTestNotification called', { deviceId });
    return Promise.resolve()
  },

  sendUserNotification: (firebaseUid: string): Promise<void> => {
    logger.log('sendUserNotification called', { firebaseUid });
    return Promise.resolve()
  },

  sendDeviceNotification: (deviceId: string): Promise<void> => {
    logger.log('sendDeviceNotification called', { deviceId });
    return Promise.resolve()
  },
};