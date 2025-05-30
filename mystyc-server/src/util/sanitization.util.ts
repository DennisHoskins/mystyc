import { BadRequestException } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import validator from 'validator';

import { logger } from '@/util/logger';

export interface SanitizationOptions {
  fieldName: string;
  firebaseUid?: string;
  allowEmpty?: boolean;
  maxLength?: number;
}

export class SanitizationUtil {
  /**
   * Sanitize and validate text input (EXISTING METHOD)
   * Throws BadRequestException for malicious input
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
   * Validate email format and normalize (EXISTING METHOD)
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

  // NEW METHODS FOR SPECIFIC FIELD TYPES

  /**
   * Sanitize device ID with security logging
   */
  static sanitizeDeviceId(value: string, options: Partial<SanitizationOptions> = {}): string {
    return this.sanitizeText(value, {
      fieldName: 'deviceId',
      maxLength: 64,
      ...options
    });
  }

  /**
   * Sanitize platform with lowercase normalization
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
   * Sanitize timezone
   */
  static sanitizeTimezone(value: string, options: Partial<SanitizationOptions> = {}): string {
    return this.sanitizeText(value, {
      fieldName: 'timezone',
      maxLength: 50,
      ...options
    });
  }

  /**
   * Sanitize language code
   */
  static sanitizeLanguageCode(value: string, options: Partial<SanitizationOptions> = {}): string {
    return this.sanitizeText(value, {
      fieldName: 'language',
      maxLength: 10,
      ...options
    });
  }

  /**
   * Sanitize app version
   */
  static sanitizeVersion(value: string, options: Partial<SanitizationOptions> = {}): string {
    return this.sanitizeText(value, {
      fieldName: 'appVersion',
      maxLength: 20,
      allowEmpty: true,
      ...options
    });
  }

  /**
   * Sanitize FCM token with extra care for length
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
   * Sanitize user agent with lenient approach
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
   * Sanitize Firebase UID
   */
  static sanitizeFirebaseUid(value: string, options: Partial<SanitizationOptions> = {}): string {
    return this.sanitizeText(value, {
      fieldName: 'firebaseUid',
      maxLength: 128,
      ...options
    });
  }

  /**
   * Sanitize Firebase token with extra security
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

  /**
   * Sanitize IP address
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
   * Sanitize query parameters for admin endpoints
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
   * Sanitize date parameters
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

  /**
   * Helper method for logging with context
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