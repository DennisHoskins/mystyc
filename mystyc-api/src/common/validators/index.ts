import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments
} from 'class-validator';
import validator from 'validator';

// Device and FCM validation
@ValidatorConstraint({ name: 'validDeviceId', async: false })
export class IsValidDeviceId implements ValidatorConstraintInterface {
  validate(deviceId: string, args: ValidationArguments) {
    if (!deviceId) return false;
    
    const validFormat = /^[a-zA-Z0-9_-]{8,64}$/.test(deviceId);
    
    const suspiciousPatterns = [
      /\.\./,
      /[<>'"]/,
      /javascript:/i,
      /data:/i,
      /vbscript:/i
    ];
    
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(deviceId));
    
    return validFormat && !hasSuspiciousContent;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Device ID must be 8-64 characters of letters, numbers, underscore, or dash only';
  }
}

@ValidatorConstraint({ name: 'validFCMToken', async: false })
export class IsValidFCMToken implements ValidatorConstraintInterface {
  validate(token: string, args: ValidationArguments) {
    if (!token) return true; // Handle optional in decorator
    
    if (token.length < 100 || token.length > 500) return false;
    
    const validFormat = /^[A-Za-z0-9_:-]+$/.test(token);
    
    return validFormat;
  }

  defaultMessage(args: ValidationArguments) {
    return 'FCM token format is invalid';
  }
}

@ValidatorConstraint({ name: 'validFirebaseToken', async: false })
export class IsValidFirebaseToken implements ValidatorConstraintInterface {
  validate(token: string, args: ValidationArguments) {
    if (!token) return false;
    
    // Firebase ID tokens are JWTs with 3 parts
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Each part should be valid base64
    const base64Pattern = /^[A-Za-z0-9_-]+$/;
    if (!parts.every(part => base64Pattern.test(part))) return false;
    
    // Length should be reasonable for Firebase tokens
    if (token.length < 100 || token.length > 2000) return false;
    
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Firebase token format is invalid';
  }
}

@ValidatorConstraint({ name: 'validFirebaseUid', async: false })
export class IsValidFirebaseUid implements ValidatorConstraintInterface {
  validate(uid: string, args: ValidationArguments) {
    if (!uid) return false;
    
    // Firebase UIDs are typically 28 characters, alphanumeric
    const validFormat = /^[a-zA-Z0-9]{20,128}$/.test(uid);
    
    return validFormat;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Firebase UID format is invalid';
  }
}

// Platform and device info validation
@ValidatorConstraint({ name: 'validPlatform', async: false })
export class IsValidPlatform implements ValidatorConstraintInterface {
  validate(platform: string, args: ValidationArguments) {
    if (!platform) return false;
    
    const validFormat = /^[a-zA-Z0-9_-]{2,20}$/.test(platform);
    
    return validFormat;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Platform must be 2-20 characters of letters, numbers, underscore, or dash only';
  }
}

@ValidatorConstraint({ name: 'validUserAgent', async: false })
export class IsValidUserAgent implements ValidatorConstraintInterface {
  validate(userAgent: string, args: ValidationArguments) {
    if (!userAgent) return false;
    
    // User agents should be reasonable length and not contain obvious injection attempts
    if (userAgent.length < 10 || userAgent.length > 1000) return false;
    
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i
    ];
    
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    
    return !hasSuspiciousContent;
  }

  defaultMessage(args: ValidationArguments) {
    return 'User agent contains invalid content';
  }
}

@ValidatorConstraint({ name: 'validLanguageCode', async: false })
export class IsValidLanguageCode implements ValidatorConstraintInterface {
  validate(language: string, args: ValidationArguments) {
    if (!language) return false;
    
    // ISO language codes: en, en-US, zh-CN, etc.
    const validFormat = /^[a-z]{2,3}(-[A-Z]{2})?$/.test(language);
    
    return validFormat;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Language must be valid format (e.g., en, en-US)';
  }
}

@ValidatorConstraint({ name: 'validTimezone', async: false })
export class IsValidTimezone implements ValidatorConstraintInterface {
  validate(timezone: string, args: ValidationArguments) {
    if (!timezone) return false;
    
    const validFormats = [
      /^[A-Z][a-z]+\/[A-Z][a-z_]+$/, // America/New_York
      /^UTC([+-]\d{1,2})?$/, // UTC, UTC+5, UTC-3
      /^GMT([+-]\d{1,2})?$/, // GMT, GMT+5, GMT-3
      /^[A-Z]{3,4}$/ // EST, PST, etc.
    ];
    
    return validFormats.some(format => format.test(timezone));
  }

  defaultMessage(args: ValidationArguments) {
    return 'Timezone must be a valid format (e.g., America/New_York, UTC, GMT+5)';
  }
}

@ValidatorConstraint({ name: 'validSemVer', async: false })
export class IsValidSemVer implements ValidatorConstraintInterface {
  validate(version: string, args: ValidationArguments) {
    if (!version) return true; // Optional field
    
    // Semantic versioning: 1.2.3, 1.0.0-beta, etc.
    const semverPattern = /^[0-9]+\.[0-9]+\.[0-9]+([+-][a-zA-Z0-9]+)?$/;
    
    return semverPattern.test(version);
  }

  defaultMessage(args: ValidationArguments) {
    return 'App version must be valid semver format (e.g., 1.2.3, 1.0.0-beta)';
  }
}

// Date/time validation
@ValidatorConstraint({ name: 'validClientTimestamp', async: false })
export class IsValidClientTimestamp implements ValidatorConstraintInterface {
  validate(timestamp: string, args: ValidationArguments) {
    if (!timestamp) return false;
    
    if (!validator.isISO8601(timestamp)) return false;
    
    const date = new Date(timestamp);
    const now = new Date();
    
    if (isNaN(date.getTime())) return false;
    
    // Check if date is not too far in the future (max 1 hour)
    if (date.getTime() > now.getTime() + (60 * 60 * 1000)) return false;
    
    // Check if date is not too far in the past (max 7 days)
    if (date.getTime() < now.getTime() - (7 * 24 * 60 * 60 * 1000)) return false;
    
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Client timestamp must be valid ISO8601 format within reasonable time range';
  }
}

@ValidatorConstraint({ name: 'validBirthDate', async: false })
export class IsValidBirthDate implements ValidatorConstraintInterface {
  validate(dateString: string, args: ValidationArguments) {
    if (!dateString) return true; // Optional field
    
    const date = new Date(dateString);
    const now = new Date();
    const minDate = new Date('1900-01-01');
    
    if (isNaN(date.getTime())) return false;
    if (date > now) return false;
    if (date < minDate) return false;
    
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Birth date must be a valid date between 1900-01-01 and today';
  }
}

@ValidatorConstraint({ name: 'validDateRange', async: false })
export class IsValidDateRange implements ValidatorConstraintInterface {
  validate(startDate: string, args: ValidationArguments) {
    if (!startDate) return true; // Optional
    
    const endDateField = args.constraints[0];
    const endDate = (args.object as any)[endDateField];
    
    if (!endDate) return true; // If no end date, just validate start date format
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
    
    return start <= end;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Start date must be before or equal to end date';
  }
}

// Enum validation
@ValidatorConstraint({ name: 'validZodiacSign', async: false })
export class IsValidZodiacSign implements ValidatorConstraintInterface {
  private readonly validSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  validate(sign: string, args: ValidationArguments) {
    if (!sign) return true; // Optional field
    return this.validSigns.includes(sign);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Zodiac sign must be one of: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces';
  }
}

@ValidatorConstraint({ name: 'validAuthEventType', async: false })
export class IsValidAuthEventType implements ValidatorConstraintInterface {
  private readonly validTypes = ['login', 'logout', 'create'];

  validate(type: string, args: ValidationArguments) {
    if (!type) return false;
    return this.validTypes.includes(type);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Auth event type must be login, logout, or create';
  }
}

// Pagination validation
@ValidatorConstraint({ name: 'validPaginationLimit', async: false })
export class IsValidPaginationLimit implements ValidatorConstraintInterface {
  validate(limit: number, args: ValidationArguments) {
    if (limit === undefined || limit === null) return true; // Optional
    
    return Number.isInteger(limit) && limit >= 1 && limit <= 100;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Limit must be an integer between 1 and 100';
  }
}

@ValidatorConstraint({ name: 'validPaginationOffset', async: false })
export class IsValidPaginationOffset implements ValidatorConstraintInterface {
  validate(offset: number, args: ValidationArguments) {
    if (offset === undefined || offset === null) return true; // Optional
    
    return Number.isInteger(offset) && offset >= 0;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Offset must be a non-negative integer';
  }
}