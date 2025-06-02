import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { firebaseAdmin } from '@/auth/firebase-admin.provider';
import { DeviceService } from '@/devices/device.service';
import { UserProfileService } from '@/users/user-profile.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { logger } from '@/util/logger';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly userProfileService: UserProfileService
  ) {}

  async sendNotification(token: string, title: string, body: string) {
    try {
      const message = {
        data: {
          title,
          body,
        },
        token,
      };

      const response = await firebaseAdmin.messaging().send(message);
      logger.info('Notification sent successfully', { 
        messageId: response,
        token: token.substring(0, 20) + '...' 
      });
      
      return response;
    } catch (error) {
      logger.error('Failed to send notification', { 
        error: error.message,
        token: token.substring(0, 20) + '...' 
      });
      throw error;
    }
  }

  async sendNotificationToTargets(
    adminFirebaseUid: string,
    sendNotificationDto: SendNotificationDto
  ): Promise<{ success: boolean; sent: number; failed: number; details: any[] }> {
    const { title = 'Hello World', body = 'This is a test notification', deviceId, firebaseUid, broadcast, test } = sendNotificationDto;
    
    // Validate that exactly one target type is provided
    const targetCount = [deviceId, firebaseUid, broadcast, test].filter(Boolean).length;
    if (targetCount !== 1) {
      throw new BadRequestException('Exactly one target type must be specified: deviceId, firebaseUid, broadcast, or test');
    }

    const results = {
      success: true,
      sent: 0,
      failed: 0,
      details: []
    };

    try {
      if (test) {
        // Send to admin's own devices
        await this.sendToUserDevices(adminFirebaseUid, title, body, results);
      } else if (deviceId) {
        // Send to specific device
        await this.sendToDevice(deviceId, title, body, results);
      } else if (firebaseUid) {
        // Send to all devices of a specific user
        await this.sendToUserDevices(firebaseUid, title, body, results);
      } else if (broadcast) {
        // Send to all devices in the system
        await this.sendBroadcast(title, body, results);
      }

      logger.info('Notification batch completed', {
        adminUid: adminFirebaseUid,
        targetType: test ? 'test' : deviceId ? 'device' : firebaseUid ? 'user' : 'broadcast',
        sent: results.sent,
        failed: results.failed
      });

      return results;
    } catch (error) {
      logger.error('Notification batch failed', {
        adminUid: adminFirebaseUid,
        error: error.message
      });
      
      results.success = false;
      throw error;
    }
  }

  private async sendToDevice(deviceId: string, title: string, body: string, results: any): Promise<void> {
    const device = await this.deviceService.findByDeviceId(deviceId);
    
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (!device.fcmToken) {
      throw new BadRequestException('Device does not have FCM token - notifications not enabled');
    }

    try {
      const messageId = await this.sendNotification(device.fcmToken, title, body);
      results.sent += 1;
      results.details.push({
        deviceId,
        firebaseUid: device.firebaseUid,
        status: 'sent',
        messageId
      });
    } catch (error) {
      results.failed += 1;
      results.details.push({
        deviceId,
        firebaseUid: device.firebaseUid,
        status: 'failed',
        error: error.message
      });
    }
  }

  private async sendToUserDevices(firebaseUid: string, title: string, body: string, results: any): Promise<void> {
    // Verify user exists
    const user = await this.userProfileService.findByFirebaseUid(firebaseUid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const devices = await this.deviceService.findByFirebaseUid(firebaseUid);
    
    if (devices.length === 0) {
      throw new NotFoundException('User has no registered devices');
    }

    // Filter devices with FCM tokens
    const notifiableDevices = devices.filter(device => device.fcmToken);
    
    if (notifiableDevices.length === 0) {
      throw new BadRequestException('User has no devices with FCM tokens - notifications not enabled');
    }

    for (const device of notifiableDevices) {
      try {
        const messageId = await this.sendNotification(device.fcmToken, title, body);
        results.sent += 1;
        results.details.push({
          deviceId: device.deviceId,
          firebaseUid: device.firebaseUid,
          status: 'sent',
          messageId
        });
      } catch (error) {
        results.failed += 1;
        results.details.push({
          deviceId: device.deviceId,
          firebaseUid: device.firebaseUid,
          status: 'failed',
          error: error.message
        });
      }
    }
  }

  private async sendBroadcast(title: string, body: string, results: any): Promise<void> {
    const allDevices = await this.deviceService.findAll();
    
    // Filter devices with FCM tokens
    const notifiableDevices = allDevices.filter(device => device.fcmToken);
    
    if (notifiableDevices.length === 0) {
      throw new BadRequestException('No devices with FCM tokens found in the system');
    }

    logger.info('Starting broadcast notification', {
      totalDevices: allDevices.length,
      notifiableDevices: notifiableDevices.length
    });

    for (const device of notifiableDevices) {
      try {
        const messageId = await this.sendNotification(device.fcmToken, title, body);
        results.sent += 1;
        results.details.push({
          deviceId: device.deviceId,
          firebaseUid: device.firebaseUid,
          status: 'sent',
          messageId
        });
      } catch (error) {
        results.failed += 1;
        results.details.push({
          deviceId: device.deviceId,
          firebaseUid: device.firebaseUid,
          status: 'failed',
          error: error.message
        });
      }
    }
  }
}