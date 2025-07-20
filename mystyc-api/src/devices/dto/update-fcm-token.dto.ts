import {
  IsString,
  IsNotEmpty,
  Length,
} from 'class-validator';

export class UpdateFcmTokenDto {
  @IsString()
  @IsNotEmpty()
  firebaseUid!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  @Length(100, 500)
  fcmToken!: string;
}