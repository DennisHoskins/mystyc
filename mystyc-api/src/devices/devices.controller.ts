import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { FirebaseUser } from '@/common/decorators/user.decorator';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { DevicesService } from './devices.service';
import { Device } from '@/common/interfaces/device.interface';
import { logger } from '@/common/util/logger';

@Controller('devices')
export class DevicesController {
  constructor(private readonly deviceService: DevicesService) {}

  /**
   * Updates FCM token for user's device to enable push notifications
   * Called after login when client obtains FCM permission and token
   * @param firebaseUser - Firebase user from auth guard (provides firebaseUid)
   * @param updateFcmTokenDto - Device ID and new FCM token
   * @returns Promise<{success: boolean, message: string, deviceId: string}> - Update confirmation
   */
  @Post('notify-token')
  @UseGuards(FirebaseAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async updateFcmToken(
    @FirebaseUser() firebaseUser,
    @Body() updateFcmTokenDto: UpdateFcmTokenDto
  ): Promise<Device> {
    logger.info('Updating FCM token via controller', {
      uid: firebaseUser.uid,
      deviceId: updateFcmTokenDto.deviceId
    }, 'DevicesController');

    try {
      const device = await this.deviceService.updateFcmToken(
        firebaseUser.uid,
        updateFcmTokenDto
      );

      logger.info('FCM token updated successfully via controller', {
        uid: firebaseUser.uid,
        deviceId: device.deviceId
      }, 'DevicesController');

      return device;
    } catch (error) {
      logger.error('FCM token update failed via controller', {
        uid: firebaseUser.uid,
        deviceId: updateFcmTokenDto.deviceId,
        error: error.message
      }, 'DevicesController');

      throw error;
    }
  }
}