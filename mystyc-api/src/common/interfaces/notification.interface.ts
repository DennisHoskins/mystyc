export interface Notification {
  _id?: string;
  firebaseUid: string;
  deviceId?: string;
  deviceName?: string;
  fcmToken?: string;
  title: string;
  body: string;
  type: 'test' | 'admin' | 'broadcast' | 'schedule';
  source: 'api';
  status: 'pending' | 'sent' | 'failed';
  messageId?: string;
  error?: string;
  sentBy: string;
  sentAt?: Date;
  scheduleId?: string;
  executionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}