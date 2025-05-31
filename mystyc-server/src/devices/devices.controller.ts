import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { FirebaseUser } from '@/common/decorators/user.decorator';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { DeviceService } from './device.service';
import { logger } from '@/util/logger';

@Controller('devices')
export class DevicesController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('notify-token')
  @UseGuards(FirebaseAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async updateFcmToken(
    @FirebaseUser() firebaseUser,
    @Body() updateFcmTokenDto: UpdateFcmTokenDto
  ) {
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

      return {
        success: true,
        message: 'FCM token updated successfully',
        deviceId: device.deviceId
      };
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