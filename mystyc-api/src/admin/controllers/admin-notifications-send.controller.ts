import { Controller, Post, UseGuards, Param, Body, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from 'mystyc-common/constants/roles.enum';
import { FirebaseUser } from 'mystyc-common/schemas/';
import { FirebaseUser as FirebaseUserDecorator } from '@/common/decorators/user.decorator';
import { DevicesService } from '@/devices/devices.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { logger } from '@/common/util/logger';

@Controller('admin/notifications/send')
export class AdminNotificationsSendController {

  constructor(
    private readonly deviceService: DevicesService,
    private readonly notificationsService: NotificationsService
  ) {}

  // POST/PUT/PATCH Methods (Write Operations)

  // Utility Methods

  /**
   * Validates that specified device belongs to the requesting admin user
   * @param user - Firebase authentication user object (admin)
   * @param deviceId - Device ID to validate ownership of
   * @returns Promise<Device> - Validated device object
   * @throws UnauthorizedException when device doesn't belong to admin
   */
  private async validateDeviceForUser(user: FirebaseUser, deviceId?: string) {
    const adminDevices = await this.deviceService.findByFirebaseUid(user.uid);
    
    logger.info('Validating device for user', {
      adminUid: user.uid,
      adminDevices: adminDevices.map(d => ({ 
        deviceId: d.deviceId, 
        platform: d.platform,
        hasToken: !!d.fcmToken 
      })),
      providedDeviceId: deviceId
    }, 'AdminNotificationsSendController');

    const matchingDevice = adminDevices.find(device => device.deviceId === deviceId);
    
    if (!matchingDevice) {
      logger.security('Unable to locate Device', {
        adminUid: user.uid,
        providedDeviceId: deviceId,
        adminDeviceIds: adminDevices.map(d => d.deviceId),
        severity: 'critical'
      });
      
      throw new UnauthorizedException('FCM token does not belong to your devices');
    }

    return matchingDevice;
  }
}