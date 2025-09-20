import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';

export const NotificationType = z.enum(['test', 'admin', 'broadcast', 'schedule']);
export const NotificationSource = z.enum(['api']);
export const NotificationStatus = z.enum(['pending', 'sent', 'failed']);

export const NotificationInputSchema = z.object({
  firebaseUid: z.string().min(20).max(128),
  deviceId: z.string().min(8).max(64).optional(),
  deviceName: z.string().trim().optional(),
  fcmToken: z.string().min(100).max(500).optional().nullable(),
  title: z.string().min(1).max(100).trim(),
  body: z.string().min(1).max(500).trim(),
  type: NotificationType,
  source: NotificationSource.default('api'),
  status: NotificationStatus.default('pending'),
  messageId: z.string().optional(),
  error: z.string().optional(),
  sentBy: z.string().min(1).trim(),
  sentAt: z.date().optional(),
  scheduleId: z.string().optional(),
  executionId: z.string().optional(),
}).strict();

export const NotificationSchema = NotificationInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type NotificationInput = z.input<typeof NotificationInputSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationTypeValue = z.infer<typeof NotificationType>;
export type NotificationStatusValue = z.infer<typeof NotificationStatus>;

export const validateNotification = (data: unknown) => 
  validateWithError(NotificationSchema, data, { schema: 'Notification' });
export const validateNotificationSafe = (data: unknown) => 
  validateSafely(NotificationSchema, data);
export const validateNotificationInput = (data: unknown) => 
  validateWithError(NotificationInputSchema, data, { schema: 'NotificationInput' });
export const validateNotificationInputSafe = (data: unknown) => 
  validateSafely(NotificationInputSchema, data);