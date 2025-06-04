import { 
  IsEmail, 
  IsOptional, 
  IsString, 
  IsArray, 
  IsEnum, 
  MinLength,
  MaxLength,
  Matches,
  IsISO8601,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments
} from 'class-validator';
import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';
import validator from 'validator';

import {
  ValidateFirebaseUid
} from '@/common/decorators/validation.decorators';

import { UserRole } from '@/common/enums/roles.enum';
import { logger } from '@/util/logger';

// Custom validator for birth date
@ValidatorConstraint({ name: 'validBirthDate', async: false })
export class IsValidBirthDate implements ValidatorConstraintInterface {
  validate(dateString: string, args: ValidationArguments) {
    if (!dateString) return true; // Optional field
    
    const date = new Date(dateString);
    const now = new Date();
    const minDate = new Date('1900-01-01');
    
    // Check if date is valid
    if (isNaN(date.getTime())) return false;
    
    // Check if date is not in the future
    if (date > now) return false;
    
    // Check if date is not too far in the past
    if (date < minDate) return false;
    
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Birth date must be a valid date between 1900-01-01 and today';
  }
}

// Custom validator for zodiac signs
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

export class CreateUserDto {
  @ValidateFirebaseUid()
  firebaseUid: string;

  @IsOptional()
  @IsArray({ message: 'Roles must be an array' })
  @IsEnum(UserRole, { each: true, message: 'Invalid role provided' })
  roles?: UserRole[];

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(254, { message: 'Email address too long' })
  @Transform(({ value }) => {
    if (!value) return value;
    return validator.normalizeEmail(value) || value;
  })
  email: string;

  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  @MinLength(1, { message: 'Full name cannot be empty' })
  @MaxLength(100, { message: 'Full name too long (max 100 characters)' })
  @Matches(/^[a-zA-Z\s\-'\.]+$/, { message: 'Full name contains invalid characters' })
  @Transform(({ value, obj }) => {
    if (!value) return value;
    
    const original = value;
    const cleaned = sanitizeHtml(value, { 
      allowedTags: [], 
      allowedAttributes: {} 
    });
    const trimmed = validator.trim(cleaned);
    
    // Log suspicious input
    if (original !== trimmed && original.length > trimmed.length + 10) {
      logger.security('Suspicious input sanitized in fullName', {
        original: original.substring(0, 100),
        cleaned: trimmed,
        firebaseUid: obj.firebaseUid
      });
    }
    
    // Normalize whitespace
    return trimmed.replace(/\s+/g, ' ');
  })
  fullName?: string;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Date of birth must be in YYYY-MM-DD format' })
  @Validate(IsValidBirthDate)
  dateOfBirth?: Date;

  @IsOptional()
  @IsString({ message: 'Zodiac sign must be a string' })
  @Validate(IsValidZodiacSign)
  @Transform(({ value, obj }) => {
    if (!value) return value;
    
    const original = value;
    const cleaned = sanitizeHtml(value, { 
      allowedTags: [], 
      allowedAttributes: {} 
    });
    const trimmed = validator.trim(cleaned);
    
    // Log suspicious input
    if (original !== trimmed && original.length > trimmed.length + 5) {
      logger.security('Suspicious input sanitized in zodiacSign', {
        original: original.substring(0, 50),
        cleaned: trimmed,
        firebaseUid: obj.firebaseUid
      });
    }
    
    // Normalize case (capitalize first letter)
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  })
  zodiacSign?: string;
}