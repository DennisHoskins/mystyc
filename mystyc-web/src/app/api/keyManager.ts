import 'server-only';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { logger } from '@/util/logger';

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

// Create a 32-byte key from the environment variable
const ENCRYPTION_KEY = createHash('sha256').update(COOKIE_ENCRYPTION_KEY!).digest();

/**
 * Generate a deterministic device ID from a device fingerprint
 */
export function generateDeviceId(fingerprint: string): string {
  const hash = createHash('sha256');
  hash.update(fingerprint + DEVICE_SESSION_SALT);
  const deviceId = hash.digest('hex');
  logger.log('[keyManager] Generated device ID:', deviceId.substring(0, 8));
  return deviceId;
}

/**
 * Generate a session ID from device ID and Firebase UID
 */
export function generateSessionId(deviceId: string, firebaseUid: string): string {
  const hash = createHash('sha256');
  hash.update(deviceId + firebaseUid + DEVICE_SESSION_SALT);
  const sessionId = hash.digest('hex');
  logger.log('[keyManager] Generated session ID for device:', deviceId.substring(0, 8), 'uid:', firebaseUid);
  return sessionId;
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
  const isValid = sessionId === expectedSessionId;
  if (!isValid) {
    logger.error('[keyManager] Session validation failed - possible tampering');
    logger.log('[keyManager] Expected:', expectedSessionId.substring(0, 8), 'Got:', sessionId.substring(0, 8));
  }
  return isValid;
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
  const cookieName = '_mst_' + hash.digest('hex').substring(0, 8);
  logger.log('[keyManager] Session cookie name:', cookieName);
  return cookieName;
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
  const cookieName = '_mst_' + hash.digest('hex').substring(0, 8);
  logger.log('[keyManager] Device cookie name:', cookieName);
  return cookieName;
}

/**
 * Encrypt cookie value (passthrough in dev, encrypted in prod)
 */
export function encryptCookieValue(value: string): string {
  if (isDev) {
    return value;
  }
  
  logger.log('[keyManager] Encrypting cookie value');
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Prepend IV to encrypted value
  const result = iv.toString('hex') + ':' + encrypted;
  logger.log('[keyManager] Cookie encrypted successfully');
  return result;
}

/**
 * Decrypt cookie value (passthrough in dev, decrypted in prod)
 */
export function decryptCookieValue(encryptedValue: string): string {
  if (isDev) {
    return encryptedValue;
  }
  
  try {
    logger.log('[keyManager] Decrypting cookie value');
    
    // Extract IV and encrypted data
    const parts = encryptedValue.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted value format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    logger.log('[keyManager] Cookie decrypted successfully');
    return decrypted;
  } catch (error) {
    logger.error('[keyManager] Failed to decrypt cookie value:', error);
    return '';
  }
}