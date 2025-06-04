import { Controller, Post, Body, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { FirebaseUser } from '@/common/interfaces/firebaseUser.interface';
import { FirebaseUser as FirebaseUserDecorator } from '@/common/decorators/user.decorator';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { DeviceService } from '@/devices/device.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { TestNotificationDto } from '@/notifications/dto/test-notification.dto';
import { SendNotificationDto } from '@/notifications/dto/send-notification.dto';
import { logger } from '@/util/logger';

@Controller('admin/notifications')
export class AdminNotificationsSendController {

  constructor(
    private readonly deviceService: DeviceService,
    private readonly notificationsService: NotificationsService
  ) {}

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

  @Post('test')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async sendTestNotification(
    @Body() testNotificationDto: TestNotificationDto,
    @FirebaseUserDecorator() user: FirebaseUser
  ) {

    const matchingDevice = await this.validateDeviceForUser(user, testNotificationDto.deviceId);

    try {
      const result = await this.notificationsService.sendDirectTokenNotification(
        matchingDevice.fcmToken,
        'Hello World',
        'This is a test notification from your server!',
        'test',
        user.uid,
        matchingDevice.deviceId
      );

      return {
        success: true,
        messageId: result.messageId,
        notificationId: result.notificationId
      };
    } catch (error) {
      logger.error('Test notification failed', { error: error.message }, 'AdminNotificationsSendController');
      throw error;
    }
  }

  @Post('send')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async sendNotification(
    @Body() sendNotificationDto: SendNotificationDto,
    @FirebaseUserDecorator() user: FirebaseUser
  ) {
    logger.info('Admin sending notification', {
      adminUid: user.uid,
      targetType: sendNotificationDto.test ? 'test' : 
                  sendNotificationDto.deviceId ? 'device' : 
                  sendNotificationDto.firebaseUid ? 'user' : 
                  sendNotificationDto.broadcast ? 'broadcast' : 'unknown',
      title: sendNotificationDto.title,
      hasCustomMessage: !!(sendNotificationDto.title || sendNotificationDto.body)
    }, 'AdminNotificationsSendController');

    try {
      const result = await this.notificationsService.sendNotificationToTargets(
        user.uid,
        sendNotificationDto
      );

      logger.info('Notification batch completed successfully', {
        adminUid: user.uid,
        sent: result.sent,
        failed: result.failed
      }, 'AdminNotificationsSendController');

      return result;
    } catch (error) {
      logger.error('Notification batch failed', { 
        adminUid: user.uid,
        error: error.message 
      }, 'AdminNotificationsSendController');
      throw error;
    }
  }
}