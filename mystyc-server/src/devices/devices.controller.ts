import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { z } from 'zod';
import { FirebaseUser as FirebaseUserInterface, Device, UpdateFcmTokenSchema } from 'mystyc-common/schemas';

import { FirebaseUser } from '@/common/decorators/user.decorator';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { logger } from '@/common/util/logger';
import { DevicesService } from './devices.service';

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
    @FirebaseUser() firebaseUser: FirebaseUserInterface,
    @Body(new ZodValidationPipe(UpdateFcmTokenSchema)) updateFcmTokenDto: z.infer<typeof UpdateFcmTokenSchema>
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
        error
      }, 'DevicesController');

      throw error;
    }
  }
}