import {
  IsString,
  IsOptional,
  IsNotEmpty,
  Length,
  IsDateString,
  Matches,
} from 'class-validator';

export class DeviceDto {
  @IsString()
  @IsNotEmpty()
  firebaseUid!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'deviceId must contain only letters, numbers, underscore, or dash'
  })
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  deviceName!: string;

  @IsOptional()
  @IsString()
  @Length(100, 500)
  fcmToken?: string;

  @IsOptional()
  @IsDateString()
  fcmTokenUpdatedAt?: Date;

  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  platform!: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  @Matches(/^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/, {
    message: 'appVersion must be valid semver format (e.g., 1.2.3)'
  })
  appVersion?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  timezone!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  @Matches(/^[a-z]{2,3}(-[A-Z]{2})?$/, {
    message: 'language must be valid format (e.g., en, en-US)'
  })
  language!: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 1000)
  userAgent!: string;
}