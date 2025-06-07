import { BadRequestException } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import validator from 'validator';

import { logger } from './logger';

export interface SanitizationOptions {
  fieldName: string;
  firebaseUid?: string;
  allowEmpty?: boolean;
  maxLength?: number;
}

export class SanitizationUtil {

  // Core Security Methods

  /**
   * Sanitizes text input for security threats and validates basic constraints
   * Removes HTML tags, checks for malicious patterns, and validates length
   * @param value - Raw text input to sanitize
   * @param options - Sanitization configuration including field name and constraints
   * @returns string - Cleaned and validated text
   * @throws BadRequestException for empty required fields or malicious content
   */
  static sanitizeText(value: string, options: SanitizationOptions): string {
    if (!value) {
      if (options.allowEmpty) {
        return value;
      }
      throw new BadRequestException(`${options.fieldName} cannot be empty`);
    }

    const original = value;
    
    // Remove HTML tags and dangerous content
    const cleaned = sanitizeHtml(value, { 
      allowedTags: [], 
      allowedAttributes: {} 
    });
    
    // Trim whitespace
    const trimmed = validator.trim(cleaned);
    
    // Check for potential malicious input
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /vbscript:/gi
    ];
    
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
      pattern.test(original)
    );
    
    // Check for significant content removal (potential attack)
    const significantRemoval = original.length > trimmed.length + 10;
    
    if (hasSuspiciousContent || significantRemoval) {
      logger.security('Malicious input rejected', {
        fieldName: options.fieldName,
        originalLength: original.length,
        cleanedLength: trimmed.length,
        firebaseUid: options.firebaseUid,
        hasSuspiciousContent,
        significantRemoval
      });
      
      throw new BadRequestException(
        `Invalid ${options.fieldName}: contains potentially harmful content`
      );
    }
    
    // Check max length
    if (options.maxLength && trimmed.length > options.maxLength) {
      throw new BadRequestException(
        `${options.fieldName} must be less than ${options.maxLength} characters`
      );
    }
    
    return trimmed;
  }
  
  /**
   * Sanitizes and normalizes email addresses
   * Validates email format and normalizes to standard format
   * @param email - Email address to sanitize
   * @returns string - Normalized email address
   * @throws BadRequestException for invalid email format
   */
  static sanitizeEmail(email: string): string {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    
    const normalized = validator.normalizeEmail(email);
    if (!normalized || !validator.isEmail(normalized)) {
      throw new BadRequestException('Invalid email format');
    }
    
    return normalized;
  }

  // Device and Platform Security Methods

  /**
   * Sanitizes device ID with security logging and length constraints
   * @param value - Device ID to sanitize
   * @param options - Optional sanitization configuration
   * @returns string - Sanitized device ID
   */
  static sanitizeDeviceId(value: string, options: Partial<SanitizationOptions> = {}): string {
    return this.sanitizeText(value, {
      fieldName: 'deviceId',
      maxLength: 64,
      ...options
    });
  }

  /**
   * Sanitizes platform identifier with lowercase normalization
   * @param value - Platform name to sanitize
   * @param options - Optional sanitization configuration
   * @returns string - Sanitized and lowercased platform name
   */
  static sanitizePlatform(value: string, options: Partial<SanitizationOptions> = {}): string {
    const sanitized = this.sanitizeText(value, {
      fieldName: 'platform',
      maxLength: 20,
      ...options
    });
    
    return sanitized.toLowerCase();
  }

  /**
   * Sanitizes timezone string for security threats
   * @param value - Timezone string to sanitize
   * @param options - Optional sanitization configuration
   * @returns string - Sanitized timezone string
   */
  static sanitizeTimezone(value: string, options: Partial<SanitizationOptions> = {}): string {
    return this.sanitizeText(value, {
      fieldName: 'timezone',
      maxLength: 50,
      ...options
    });
  }

  /**
   * Sanitizes language code for security threats
   * @param value - Language code to sanitize
   * @param options - Optional sanitization configuration
   * @returns string - Sanitized language code
   */
  static sanitizeLanguageCode(value: string, options: Partial<SanitizationOptions> = {}): string {
    return this.sanitizeText(value, {
      fieldName: 'language',
      maxLength: 10,
      ...options
    });
  }

  /**
   * Sanitizes application version string (optional field)
   * @param value - App version to sanitize
   * @param options - Optional sanitization configuration
   * @returns string - Sanitized app version
   */
  static sanitizeVersion(value: string, options: Partial<SanitizationOptions> = {}): string {
    return this.sanitizeText(value, {
      fieldName: 'appVersion',
      maxLength: 20,
      allowEmpty: true,
      ...options
    });
  }

  // Token and Authentication Security Methods

  /**
   * Sanitizes FCM token with lenient content removal detection
   * FCM tokens can contain special characters, so uses relaxed suspicious content detection
   * @param value - FCM token to sanitize
   * @param options - Optional sanitization configuration
   * @returns string - Sanitized FCM token
   */
  static sanitizeFcmToken(value: string, options: Partial<SanitizationOptions> = {}): string {
    if (!value && options.allowEmpty) {
      return value;
    }

    const original = value;
    const cleaned = sanitizeHtml(value, { 
      allowedTags: [], 
      allowedAttributes: {} 
    });
    const trimmed = validator.trim(cleaned);
    
    // FCM tokens can have significant length, so be more lenient with removal detection
    if (original !== trimmed && original.length > trimmed.length + 20) {
      logger.security('Suspicious input sanitized in FCM token', {
        fieldName: options.fieldName || 'fcmToken',
        originalLength: original.length,
        cleanedLength: trimmed.length,
        firebaseUid: options.firebaseUid
      });
    }
    
    return trimmed;
  }

  /**
   * Sanitizes user agent string with lenient approach for special characters
   * User agents contain many legitimate special characters, so uses relaxed detection
   * @param value - User agent string to sanitize
   * @param options - Optional sanitization configuration
   * @returns string - Sanitized user agent string
   * @throws BadRequestException for empty or overly long user agents
   */
  static sanitizeUserAgent(value: string, options: Partial<SanitizationOptions> = {}): string {
    if (!value) {
      throw new BadRequestException('User agent cannot be empty');
    }

    const original = value;
    const cleaned = sanitizeHtml(value, { 
      allowedTags: [], 
      allowedAttributes: {} 
    });
    const trimmed = validator.trim(cleaned);
    
    // User agents can have many special chars, so be lenient with removal detection
    if (original !== trimmed && original.length > trimmed.length + 50) {
      logger.security('Suspicious input sanitized in user agent', {
        fieldName: options.fieldName || 'userAgent',
        original: original.substring(0, 100) + '...',
        cleaned: trimmed.substring(0, 100) + '...',
        firebaseUid: options.firebaseUid
      });
    }
    
    if (trimmed.length > 1000) {
      throw new BadRequestException('User agent too long (max 1000 characters)');
    }
    
    return trimmed;
  }

  /**
   * Sanitizes Firebase UID for security threats
   * @param value - Firebase UID to sanitize
   * @param options - Optional sanitization configuration
   * @returns string - Sanitized Firebase UID
   */
  static sanitizeFirebaseUid(value: string, options: Partial<SanitizationOptions> = {}): string {
    return this.sanitizeText(value, {
      fieldName: 'firebaseUid',
      maxLength: 128,
      ...options
    });
  }

  /**
   * Sanitizes Firebase token with strict security requirements
   * Tokens should not require cleaning - any modification indicates potential attack
   * @param value - Firebase token to sanitize
   * @param options - Optional sanitization configuration
   * @returns string - Sanitized Firebase token
   * @throws BadRequestException for empty tokens or tokens requiring cleaning
   */
  static sanitizeFirebaseToken(value: string, options: Partial<SanitizationOptions> = {}): string {
    if (!value) {
      throw new BadRequestException('Firebase token cannot be empty');
    }

    const original = value;
    const cleaned = sanitizeHtml(value, { 
      allowedTags: [], 
      allowedAttributes: {} 
    });
    const trimmed = validator.trim(cleaned);
    
    // Tokens should not need cleaning - any change is suspicious
    if (original !== trimmed) {
      logger.security('Suspicious input sanitized in Firebase token', {
        fieldName: options.fieldName || 'firebaseToken',
        originalLength: original.length,
        cleanedLength: trimmed.length,
        firebaseUid: options.firebaseUid
      });
      
      throw new BadRequestException('Invalid token format');
    }
    
    return trimmed;
  }

  // Network and Query Parameter Security Methods

  /**
   * Sanitizes IP address and logs private IP detection
   * @param value - IP address to sanitize
   * @param options - Optional sanitization configuration
   * @returns string - Sanitized IP address
   */
  static sanitizeIpAddress(value: string, options: Partial<SanitizationOptions> = {}): string {
    const sanitized = this.sanitizeText(value, {
      fieldName: 'ip',
      maxLength: 15, // IPv4 max length
      ...options
    });
    
    // Log private IP addresses for monitoring
    if (sanitized.startsWith('127.') || sanitized.startsWith('192.168.') || 
        sanitized.startsWith('10.') || sanitized.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
      logger.debug('Private IP address detected', { ip: sanitized });
    }
    
    return sanitized;
  }

  /**
   * Sanitizes query parameters for admin endpoints
   * @param value - Query parameter value to sanitize
   * @param fieldName - Name of the query parameter field
   * @returns string - Sanitized query parameter value
   */
  static sanitizeQueryParam(value: string, fieldName: string): string {
    if (!value) return value;
    
    return this.sanitizeText(value, {
      fieldName,
      maxLength: 100,
      allowEmpty: true
    });
  }

  /**
   * Sanitizes date parameters (ISO8601 format expected)
   * @param value - Date string to sanitize
   * @param fieldName - Name of the date field
   * @returns string - Sanitized date string
   */
  static sanitizeDateParam(value: string, fieldName: string): string {
    if (!value) return value;
    
    const sanitized = this.sanitizeText(value, {
      fieldName,
      maxLength: 30, // ISO8601 dates are ~25 characters
      allowEmpty: true
    });
    
    return sanitized;
  }

  // Utility Methods

  /**
   * Logs suspicious input with context for security monitoring
   * @param fieldName - Name of the field being sanitized
   * @param original - Original input value
   * @param cleaned - Cleaned input value
   * @param context - Additional context including Firebase UID
   */
  private static logSuspiciousInput(
    fieldName: string, 
    original: string, 
    cleaned: string, 
    context?: { firebaseUid?: string }
  ): void {
    logger.security('Suspicious input sanitized', {
      fieldName,
      originalLength: original.length,
      cleanedLength: cleaned.length,
      originalPreview: original.substring(0, 50),
      cleanedPreview: cleaned.substring(0, 50),
      ...context
    });
  }
}