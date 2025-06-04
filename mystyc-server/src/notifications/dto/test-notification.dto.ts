import {
  ValidateDeviceId,
} from '@/common/decorators/validation.decorators';

export class TestNotificationDto {
  @ValidateDeviceId()
  deviceId?: string;
}