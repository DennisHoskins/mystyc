import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { firebaseAdmin } from '@/auth/firebase-admin.provider';
import { DeviceService } from '@/devices/device.service';
import { UserProfileService } from '@/users/user-profile.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { Notification as NotificationInterface } from '@/common/interfaces/notification.interface';
import { logger } from '@/util/logger';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
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

  async sendDirectTokenNotification(
    token: string,
    title: string,
    body: string,
    type: 'test' | 'admin' | 'broadcast',
    sentBy: string
  ): Promise<{ messageId: string; notificationId: string }> {
    // Create notification record
    const notification = await this.createNotificationRecord({
      firebaseUid: sentBy, // For test notifications, use admin's UID
      title,
      body,
      type,
      sentBy
    });

    try {
      const messageId = await this.sendNotification(token, title, body);
      
      // Update notification as sent
      await this.updateNotificationStatus(notification._id.toString(), 'sent', messageId);
      
      return {
        messageId,
        notificationId: notification._id.toString()
      };
    } catch (error) {
      // Update notification as failed
      await this.updateNotificationStatus(notification._id.toString(), 'failed', undefined, error.message);
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
        await this.sendToUserDevices(adminFirebaseUid, title, body, results, 'test', adminFirebaseUid);
      } else if (deviceId) {
        // Send to specific device
        await this.sendToDevice(deviceId, title, body, results, 'admin', adminFirebaseUid);
      } else if (firebaseUid) {
        // Send to all devices of a specific user
        await this.sendToUserDevices(firebaseUid, title, body, results, 'admin', adminFirebaseUid);
      } else if (broadcast) {
        // Send to all devices in the system
        await this.sendBroadcast(title, body, results, adminFirebaseUid);
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

  private async sendToDevice(
    deviceId: string, 
    title: string, 
    body: string, 
    results: any, 
    type: 'test' | 'admin' | 'broadcast',
    sentBy: string
  ): Promise<void> {
    const device = await this.deviceService.findByDeviceId(deviceId);
    
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (!device.fcmToken) {
      throw new BadRequestException('Device does not have FCM token - notifications not enabled');
    }

    // Create notification record
    const notification = await this.createNotificationRecord({
      firebaseUid: device.firebaseUid,
      deviceId: device.deviceId,
      title,
      body,
      type,
      sentBy
    });

    try {
      const messageId = await this.sendNotification(device.fcmToken, title, body);
      
      // Update notification as sent
      await this.updateNotificationStatus(notification._id.toString(), 'sent', messageId);
      
      results.sent += 1;
      results.details.push({
        deviceId,
        firebaseUid: device.firebaseUid,
        status: 'sent',
        messageId,
        notificationId: notification._id.toString()
      });
    } catch (error) {
      // Update notification as failed
      await this.updateNotificationStatus(notification._id.toString(), 'failed', undefined, error.message);
      
      results.failed += 1;
      results.details.push({
        deviceId,
        firebaseUid: device.firebaseUid,
        status: 'failed',
        error: error.message,
        notificationId: notification._id.toString()
      });
    }
  }

  private async sendToUserDevices(
    firebaseUid: string, 
    title: string, 
    body: string, 
    results: any, 
    type: 'test' | 'admin' | 'broadcast',
    sentBy: string
  ): Promise<void> {
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
      // Create notification record for each device
      const notification = await this.createNotificationRecord({
        firebaseUid: device.firebaseUid,
        deviceId: device.deviceId,
        title,
        body,
        type,
        sentBy
      });

      try {
        const messageId = await this.sendNotification(device.fcmToken, title, body);
        
        // Update notification as sent
        await this.updateNotificationStatus(notification._id.toString(), 'sent', messageId);
        
        results.sent += 1;
        results.details.push({
          deviceId: device.deviceId,
          firebaseUid: device.firebaseUid,
          status: 'sent',
          messageId,
          notificationId: notification._id.toString()
        });
      } catch (error) {
        // Update notification as failed
        await this.updateNotificationStatus(notification._id.toString(), 'failed', undefined, error.message);
        
        results.failed += 1;
        results.details.push({
          deviceId: device.deviceId,
          firebaseUid: device.firebaseUid,
          status: 'failed',
          error: error.message,
          notificationId: notification._id.toString()
        });
      }
    }
  }

  private async sendBroadcast(
    title: string, 
    body: string, 
    results: any, 
    sentBy: string
  ): Promise<void> {
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
      // Create notification record for each device
      const notification = await this.createNotificationRecord({
        firebaseUid: device.firebaseUid,
        deviceId: device.deviceId,
        title,
        body,
        type: 'broadcast',
        sentBy
      });

      try {
        const messageId = await this.sendNotification(device.fcmToken, title, body);
        
        // Update notification as sent
        await this.updateNotificationStatus(notification._id.toString(), 'sent', messageId);
        
        results.sent += 1;
        results.details.push({
          deviceId: device.deviceId,
          firebaseUid: device.firebaseUid,
          status: 'sent',
          messageId,
          notificationId: notification._id.toString()
        });
      } catch (error) {
        // Update notification as failed
        await this.updateNotificationStatus(notification._id.toString(), 'failed', undefined, error.message);
        
        results.failed += 1;
        results.details.push({
          deviceId: device.deviceId,
          firebaseUid: device.firebaseUid,
          status: 'failed',
          error: error.message,
          notificationId: notification._id.toString()
        });
      }
    }
  }

  private async createNotificationRecord(data: {
    firebaseUid: string;
    deviceId?: string;
    title: string;
    body: string;
    type: 'test' | 'admin' | 'broadcast';
    sentBy: string;
  }): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      ...data,
      source: 'api',
      status: 'pending'
    });

    return await notification.save();
  }

  private async updateNotificationStatus(
    notificationId: string,
    status: 'sent' | 'failed',
    messageId?: string,
    error?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'sent') {
      updateData.messageId = messageId;
      updateData.sentAt = new Date();
    } else if (status === 'failed') {
      updateData.error = error;
    }

    await this.notificationModel.findByIdAndUpdate(notificationId, updateData);
  }

  async findNotifications(
    filters: {
      firebaseUid?: string;
      deviceId?: string;
      type?: 'test' | 'admin' | 'broadcast';
      status?: 'pending' | 'sent' | 'failed';
      sentBy?: string;
    },
    limit: number = 50,
    offset: number = 0
  ): Promise<NotificationInterface[]> {
    const query: any = {};

    if (filters.firebaseUid) query.firebaseUid = filters.firebaseUid;
    if (filters.deviceId) query.deviceId = filters.deviceId;
    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.sentBy) query.sentBy = filters.sentBy;

    const notifications = await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    return notifications.map(notification => this.transformToNotification(notification));
  }

  private transformToNotification(doc: NotificationDocument): NotificationInterface {
    return {
      _id: doc._id.toString(),
      firebaseUid: doc.firebaseUid,
      deviceId: doc.deviceId,
      title: doc.title,
      body: doc.body,
      type: doc.type,
      source: doc.source,
      status: doc.status,
      messageId: doc.messageId,
      error: doc.error,
      sentBy: doc.sentBy,
      sentAt: doc.sentAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}