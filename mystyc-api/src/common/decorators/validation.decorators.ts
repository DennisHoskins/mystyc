import { applyDecorators } from '@nestjs/common';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional,
  IsIP,
  IsISO8601,
  IsIn,
  IsInt,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  Validate,
  Min,
  Max
} from 'class-validator';
import { Transform } from 'class-transformer';

import {
  IsValidDeviceId,
  IsValidDeviceName,
  IsValidFCMToken,
  IsValidFcmTokenUpdatedAt,
  IsValidFirebaseToken,
  IsValidFirebaseUid,
  IsValidPlatform,
  IsValidUserAgent,
  IsValidLanguageCode,
  IsValidTimezone,
  IsValidSemVer,
  IsValidClientTimestamp,
  IsValidBirthDate,
  IsValidDateRange,
  IsValidZodiacSign,
  IsValidAuthEventType,
  IsValidPaginationLimit,
  IsValidPaginationOffset
} from '@/common/validators';

import {
  SanitizeDeviceId,
  SanitizeDeviceName,
  SanitizePlatform,
  SanitizeTimezone,
  SanitizeLanguage,
  SanitizeFcmToken,
  SanitizeFcmTokenUpdatedAt,
  SanitizeUserAgent,
  SanitizeVersion,
  SanitizeFirebaseUid,
  SanitizeFirebaseToken,
  SanitizeIpAddress,
  SanitizeText,
  SanitizeDateParam
} from './sanitization.decorators';

/**
 * Complete device ID validation with sanitization
 */
export function ValidateDeviceId() {
  return applyDecorators(
    IsString({ message: 'Device ID must be a string' }),
    IsNotEmpty({ message: 'Device ID cannot be empty' }),
    MinLength(8, { message: 'Device ID too short (min 8 characters)' }),
    MaxLength(64, { message: 'Device ID too long (max 64 characters)' }),
    Validate(IsValidDeviceId),
    SanitizeDeviceId()
  );
}

/**
 * Complete device Name validation with sanitization
 */
export function ValidateDeviceName() {
  return applyDecorators(
    IsString({ message: 'Device Name must be a string' }),
    IsNotEmpty({ message: 'Device Name cannot be empty' }),
    MinLength(8, { message: 'Device Name too short (min 8 characters)' }),
    MaxLength(64, { message: 'Device Name too long (max 64 characters)' }),
    Validate(IsValidDeviceName),
    SanitizeDeviceName()
  );
}

/**
 * Complete platform validation with sanitization and normalization
 */
export function ValidatePlatform() {
  return applyDecorators(
    IsString({ message: 'Platform must be a string' }),
    IsNotEmpty({ message: 'Platform cannot be empty' }),
    Validate(IsValidPlatform),
    SanitizePlatform()
  );
}

/**
 * Complete FCM token validation - required version
 */
export function ValidateFcmTokenRequired() {
  return applyDecorators(
    IsString({ message: 'FCM token must be a string' }),
    IsNotEmpty({ message: 'FCM token cannot be empty' }),
    MinLength(100, { message: 'FCM token too short' }),
    MaxLength(500, { message: 'FCM token too long' }),
    Validate(IsValidFCMToken),
    SanitizeFcmToken()
  );
}

/**
 * Complete FCM token validation - optional version
 */
export function ValidateFcmTokenOptional() {
  return applyDecorators(
    IsOptional(),
    IsString({ message: 'FCM token must be a string' }),
    MinLength(100, { message: 'FCM token too short' }),
    MaxLength(500, { message: 'FCM token too long' }),
    Validate(IsValidFCMToken),
    SanitizeFcmToken()
  );
}

/**
 * Complete FCM token UpdatedAt validation - optional version
 */
export function ValidateFcmTokenUpdatedAtOptional() {
  return applyDecorators(
    IsOptional(),
    IsISO8601({ strict: true }, { message: 'Fcm Update Date must be in YYYY-MM-DD format' }),
    Validate(IsValidFcmTokenUpdatedAt),
    SanitizeDateParam('fcmUpdate'),
    SanitizeFcmTokenUpdatedAt()
  );
}

/**
 * Complete Firebase UID validation
 */
export function ValidateFirebaseUid() {
  return applyDecorators(
    IsString({ message: 'Firebase UID must be a string' }),
    IsNotEmpty({ message: 'Firebase UID cannot be empty' }),
    MinLength(20, { message: 'Firebase UID too short' }),
    MaxLength(128, { message: 'Firebase UID too long' }),
    Validate(IsValidFirebaseUid),
    SanitizeFirebaseUid()
  );
}

/**
 * Complete Firebase token validation
 */
export function ValidateFirebaseToken() {
  return applyDecorators(
    IsString({ message: 'Firebase token must be a string' }),
    IsNotEmpty({ message: 'Firebase token cannot be empty' }),
    MinLength(100, { message: 'Firebase token too short' }),
    MaxLength(2000, { message: 'Firebase token too long' }),
    Validate(IsValidFirebaseToken),
    SanitizeFirebaseToken()
  );
}

/**
 * Complete timezone validation
 */
export function ValidateTimezone() {
  return applyDecorators(
    IsString({ message: 'Timezone must be a string' }),
    IsNotEmpty({ message: 'Timezone cannot be empty' }),
    MaxLength(50, { message: 'Timezone too long (max 50 characters)' }),
    Validate(IsValidTimezone),
    SanitizeTimezone()
  );
}

/**
 * Complete language code validation
 */
export function ValidateLanguageCode() {
  return applyDecorators(
    IsString({ message: 'Language must be a string' }),
    IsNotEmpty({ message: 'Language cannot be empty' }),
    MinLength(2, { message: 'Language code too short (min 2 characters)' }),
    MaxLength(10, { message: 'Language code too long (max 10 characters)' }),
    Validate(IsValidLanguageCode),
    SanitizeLanguage()
  );
}

/**
 * Complete user agent validation
 */
export function ValidateUserAgent() {
  return applyDecorators(
    IsString({ message: 'User agent must be a string' }),
    IsNotEmpty({ message: 'User agent cannot be empty' }),
    MinLength(10, { message: 'User agent too short (min 10 characters)' }),
    MaxLength(1000, { message: 'User agent too long (max 1000 characters)' }),
    Validate(IsValidUserAgent),
    SanitizeUserAgent()
  );
}

/**
 * Complete app version validation - optional
 */
export function ValidateAppVersion() {
  return applyDecorators(
    IsOptional(),
    IsString({ message: 'App version must be a string' }),
    MaxLength(20, { message: 'App version too long (max 20 characters)' }),
    Validate(IsValidSemVer),
    SanitizeVersion()
  );
}

/**
 * Complete IP address validation
 */
export function ValidateIpAddress() {
  return applyDecorators(
    IsIP(4, { message: 'IP must be a valid IPv4 address' }),
    SanitizeIpAddress()
  );
}

/**
 * Complete client timestamp validation
 */
export function ValidateClientTimestamp() {
  return applyDecorators(
    IsISO8601({ strict: true }, { message: 'Client timestamp must be in ISO8601 format' }),
    Validate(IsValidClientTimestamp),
    SanitizeDateParam('clientTimestamp')
  );
}

/**
 * Complete auth event type validation
 */
export function ValidateAuthEventType() {
  return applyDecorators(
    IsIn(['login', 'logout', 'create'], { message: 'Type must be login, logout, or create' }),
    SanitizeText('type')
  );
}

/**
 * Complete birth date validation - optional
 */
export function ValidateBirthDate() {
  return applyDecorators(
    IsOptional(),
    IsISO8601({ strict: true }, { message: 'Date of birth must be in YYYY-MM-DD format' }),
    Validate(IsValidBirthDate),
    SanitizeDateParam('dateOfBirth')
  );
}

/**
 * Complete zodiac sign validation - optional
 */
export function ValidateZodiacSign() {
  return applyDecorators(
    IsOptional(),
    IsString({ message: 'Zodiac sign must be a string' }),
    Validate(IsValidZodiacSign),
    SanitizeText('zodiacSign')
  );
}

/**
 * Pagination limit validation
 */
export function ValidatePaginationLimit() {
  return applyDecorators(
    IsOptional(),
    IsInt(),
    Min(1),
    Max(100),
    Transform(({ value }) => value ? parseInt(value) : 20),
    Validate(IsValidPaginationLimit)
  );
}

/**
 * Pagination offset validation
 */
export function ValidatePaginationOffset() {
  return applyDecorators(
    IsOptional(),
    IsInt(),
    Min(0),
    Transform(({ value }) => value ? parseInt(value) : 0),
    Validate(IsValidPaginationOffset)
  );
}

/**
 * Date range validation for queries
 */
export function ValidateDateRange(endDateField: string) {
  return applyDecorators(
    IsOptional(),
    IsISO8601(),
    Validate(IsValidDateRange, [endDateField]),
    SanitizeDateParam('startDate')
  );
}

/**
 * End date validation for queries
 */
export function ValidateEndDate() {
  return applyDecorators(
    IsOptional(),
    IsISO8601(),
    SanitizeDateParam('endDate')
  );
}