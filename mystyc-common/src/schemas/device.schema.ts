import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';

export const DeviceInputSchema = z.object({
  firebaseUid: z.string().min(20).max(128),
  deviceId: z.string()
    .min(8)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Device ID must contain only letters, numbers, underscore, or dash'),
  deviceName: z.string()
    .min(8)
    .max(64)
    .trim(),
  platform: z.string()
    .min(2)
    .max(20)
    .optional()
    .transform(val => val?.toLowerCase()),
  fcmToken: z.string()
    .min(100)
    .max(500)
    .optional()
    .nullable(),
  fcmTokenUpdatedAt: z.coerce.date()
    .optional()
    .nullable(),
  appVersion: z.string()
    .regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/, 'Invalid semver format')
    .optional(),
  timezone: z.string()
    .min(1)
    .max(50)
    .trim()
    .optional(),
  language: z.string()
    .min(2)
    .max(10)
    .regex(/^[a-z]{2,3}(-[A-Z]{2})?$/, 'Invalid language format')
    .transform(val => {
      const parts = val.split('-');
      if (parts.length === 2) {
        return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
      }
      return val.toLowerCase();
    })
    .optional(),
  userAgent: z.string()
    .min(10)
    .max(1000)
    .trim()
    .optional()
}).strict();

export const UpdateFcmTokenSchema = z.object({
  firebaseUid: z.string().min(20).max(128),
  deviceId: z.string().min(8).max(64),
  fcmToken: z.string().min(100).max(500)
});

export const DeviceSchema = DeviceInputSchema
  .extend({ userAgentParsed: z.record(z.unknown()).optional() })
  .refine(
    data => !data.deviceId.includes('..') && !data.deviceId.includes('/'),
    { message: 'Device ID contains invalid characters', path: ['deviceId'] }
  );
  
export type DeviceInput = z.input<typeof DeviceInputSchema>;
export type Device = z.infer<typeof DeviceSchema>;
export type UpdateFcmToken = z.infer<typeof UpdateFcmTokenSchema>;

export const DeviceFormSchema = DeviceInputSchema.extend({
  confirmDeviceName: z.string().optional()
}).refine(
  data => !data.confirmDeviceName || data.deviceName === data.confirmDeviceName,
  { message: "Device names don't match", path: ['confirmDeviceName'] }
);

export const DeviceUpdateSchema = DeviceInputSchema.partial().required({
  deviceId: true
}).refine(
  data => !data.deviceId.includes('..') && !data.deviceId.includes('/'),
  { message: 'Device ID contains invalid characters', path: ['deviceId'] }
);

export const extractPlatformFromUA = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
  if (ua.includes('android')) return 'android';
  if (ua.includes('windows')) return 'windows';
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
};

export const validateDevice = (data: unknown) => 
  validateWithError(DeviceSchema, data, { schema: 'Device' });
export const validateDeviceSafe = (data: unknown) => 
  validateSafely(DeviceSchema, data);
export const validateDeviceInput = (data: unknown) => 
  validateWithError(DeviceInputSchema, data, { schema: 'DeviceInput' });
export const validateDeviceInputSafe = (data: unknown) => 
  validateSafely(DeviceInputSchema, data);