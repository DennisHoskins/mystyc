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
   * Sanitize and validate text input
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
   * Validate email format and normalize
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
}