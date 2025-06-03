export interface Notification {
  _id?: string;
  firebaseUid: string;
  deviceId?: string;
  title: string;
  body: string;
  type: 'test' | 'admin' | 'broadcast';
  source: 'api';
  status: 'pending' | 'sent' | 'failed';
  messageId?: string;
  error?: string;
  sentBy: string;
  sentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}