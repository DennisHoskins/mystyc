import 'server-only';
import { createHash, createCipher, createDecipher } from 'crypto';

const DEVICE_SESSION_SALT = process.env.DEVICE_SESSION_SALT;
const COOKIE_ENCRYPTION_KEY = process.env.COOKIE_ENCRYPTION_KEY;
const SESSION_COOKIE_SEED = process.env.SESSION_COOKIE_SEED;
const DEVICE_COOKIE_SEED = process.env.DEVICE_COOKIE_SEED;

if (!DEVICE_SESSION_SALT) {
  throw new Error('DEVICE_SESSION_SALT environment variable is required');
}

if (!COOKIE_ENCRYPTION_KEY) {
  throw new Error('COOKIE_ENCRYPTION_KEY environment variable is required');
}

if (!SESSION_COOKIE_SEED) {
  throw new Error('SESSION_COOKIE_SEED environment variable is required');
}

if (!DEVICE_COOKIE_SEED) {
  throw new Error('DEVICE_COOKIE_SEED environment variable is required');
}

const isDev = process.env.NODE_ENV === 'development';

/**
 * Generate a deterministic device ID from a device fingerprint
 */
export function generateDeviceId(fingerprint: string): string {
  const hash = createHash('sha256');
  hash.update(fingerprint + DEVICE_SESSION_SALT);
  return hash.digest('hex');
}

/**
 * Generate a session ID from device ID and Firebase UID
 */
export function generateSessionId(deviceId: string, firebaseUid: string): string {
  const hash = createHash('sha256');
  hash.update(deviceId + firebaseUid + DEVICE_SESSION_SALT);
  return hash.digest('hex');
}

/**
 * Validate that a session ID matches the expected device ID and Firebase UID
 */
export function validateSessionId(
  sessionId: string, 
  deviceId: string, 
  firebaseUid: string
): boolean {
  const expectedSessionId = generateSessionId(deviceId, firebaseUid);
  return sessionId === expectedSessionId;
}

/**
 * Get session cookie name (readable in dev, obfuscated in prod)
 */
export function getSessionCookieName(): string {
  if (isDev) {
    return 'sessionId';
  }
  
  const hash = createHash('sha256');
  hash.update(SESSION_COOKIE_SEED!);
  return '_mst_' + hash.digest('hex').substring(0, 8);
}

/**
 * Get device cookie name (readable in dev, obfuscated in prod)
 */
export function getDeviceCookieName(): string {
  if (isDev) {
    return 'deviceId';
  }
  
  const hash = createHash('sha256');
  hash.update(DEVICE_COOKIE_SEED!);
  return '_mst_' + hash.digest('hex').substring(0, 8);
}

/**
 * Encrypt cookie value (passthrough in dev, encrypted in prod)
 */
export function encryptCookieValue(value: string): string {
  if (isDev) {
    return value;
  }
  
  const cipher = createCipher('aes-256-cbc', COOKIE_ENCRYPTION_KEY!);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Decrypt cookie value (passthrough in dev, decrypted in prod)
 */
export function decryptCookieValue(encryptedValue: string): string {
  if (isDev) {
    return encryptedValue;
  }
  
  try {
    const decipher = createDecipher('aes-256-cbc', COOKIE_ENCRYPTION_KEY!);
    let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt cookie value:', error);
    return '';
  }
}