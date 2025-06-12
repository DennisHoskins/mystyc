import { Transform } from 'class-transformer';

import { SanitizationUtil, SanitizationOptions } from '@/common/util/sanitization';

/**
 * Generic text sanitization decorator
 */
export const SanitizeText = (fieldName: string, options?: Partial<SanitizationOptions>) =>
  Transform(({ value, obj }) => {
    if (!value) return value;
    return SanitizationUtil.sanitizeText(value, {
      fieldName,
      firebaseUid: obj?.firebaseUid,
      ...options
    });
  });

/**
 * Sanitize text with custom normalizer function
 */
export const SanitizeAndNormalize = (
  fieldName: string, 
  normalizer: (val: string) => string,
  options?: Partial<SanitizationOptions>
) =>
  Transform(({ value, obj }) => {
    if (!value) return value;
    const sanitized = SanitizationUtil.sanitizeText(value, {
      fieldName,
      firebaseUid: obj?.firebaseUid,
      ...options
    });
    return normalizer(sanitized);
  });

/**
 * Device ID sanitization
 */
export const SanitizeDeviceId = (fieldName: string = 'deviceId') =>
  Transform(({ value, obj }) => {
    if (!value) return value;
    return SanitizationUtil.sanitizeDeviceId(value, {
      fieldName,
      firebaseUid: obj?.firebaseUid
    });
  });

/**
 * Device Name sanitization
 */
export const SanitizeDeviceName = (fieldName: string = 'deviceName') =>
  Transform(({ value, obj }) => {
    if (!value) return value;
    return SanitizationUtil.sanitizeDeviceName(value, {
      fieldName,
      firebaseUid: obj?.firebaseUid
    });
  });

/**
 * Platform sanitization with auto-lowercase
 */
export const SanitizePlatform = (fieldName: string = 'platform') =>
  Transform(({ value, obj }) => {
    if (!value) return value;
    return SanitizationUtil.sanitizePlatform(value, {
      fieldName,
      firebaseUid: obj?.firebaseUid
    });
  });

/**
 * Timezone sanitization
 */
export const SanitizeTimezone = (fieldName: string = 'timezone') =>
  Transform(({ value, obj }) => {
    if (!value) return value;
    return SanitizationUtil.sanitizeTimezone(value, {
      fieldName,
      firebaseUid: obj?.firebaseUid
    });
  });

/**
 * Language code sanitization
 */
export const SanitizeLanguage = (fieldName: string = 'language') =>
  Transform(({ value, obj }) => {
    if (!value) return value;
    return SanitizationUtil.sanitizeLanguageCode(value, {
      fieldName,
      firebaseUid: obj?.firebaseUid
    });
  });

/**
 * FCM token sanitization
 */
export const SanitizeFcmToken = (fieldName: string = 'fcmToken') =>
  Transform(({ value, obj }) => {
    if (!value) return value;
    return SanitizationUtil.sanitizeFcmToken(value, {
      fieldName,
      firebaseUid: obj?.firebaseUid,
      allowEmpty: true
    });
  });

/**
 * User agent sanitization
 */
export const SanitizeUserAgent = (fieldName: string = 'userAgent') =>
  Transform(({ value, obj }) => {
    if (!value) return value;
    return SanitizationUtil.sanitizeUserAgent(value, {
      fieldName,
      firebaseUid: obj?.firebaseUid
    });
  });

/**
 * App version sanitization
 */
export const SanitizeVersion = (fieldName: string = 'appVersion') =>
  Transform(({ value, obj }) => {
    if (!value) return value;
    return SanitizationUtil.sanitizeVersion(value, {
      fieldName,
      firebaseUid: obj?.firebaseUid
    });
  });

/**
 * Firebase UID sanitization
 */
export const SanitizeFirebaseUid = (fieldName: string = 'firebaseUid') =>
  Transform(({ value, obj }) => {
    if (!value) return value;
    return SanitizationUtil.sanitizeFirebaseUid(value, {
      fieldName,
      firebaseUid: obj?.firebaseUid
    });
  });

/**
 * Firebase token sanitization
 */
export const SanitizeFirebaseToken = (fieldName: string = 'firebaseToken') =>
  Transform(({ value, obj }) => {
    if (!value) return value;
    return SanitizationUtil.sanitizeFirebaseToken(value, {
      fieldName,
      firebaseUid: obj?.firebaseUid
    });
  });

/**
 * IP address sanitization
 */
export const SanitizeIpAddress = (fieldName: string = 'ip') =>
  Transform(({ value, obj }) => {
    if (!value) return value;
    return SanitizationUtil.sanitizeIpAddress(value, {
      fieldName,
      firebaseUid: obj?.firebaseUid
    });
  });

/**
 * Query parameter sanitization for admin endpoints
 */
export const SanitizeQueryParam = (fieldName: string) =>
  Transform(({ value }) => {
    if (!value) return value;
    return SanitizationUtil.sanitizeQueryParam(value, fieldName);
  });

/**
 * Date parameter sanitization
 */
export const SanitizeDateParam = (fieldName: string) =>
  Transform(({ value }) => {
    if (!value) return value;
    return SanitizationUtil.sanitizeDateParam(value, fieldName);
  });