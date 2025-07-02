import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';

import { firebaseAdmin } from '@/auth/firebase-admin.provider';
import { DevicesService } from '@/devices/devices.service';
import { UserProfilesService } from '@/users/user-profiles.service';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { Notification as NotificationInterface } from '@/common/interfaces/notification.interface';
import { Device } from '@/common/interfaces/device.interface';
import { SendNotificationDto } from './dto/send-notification.dto';
import { BaseAdminQueryDto } from '@/admin/dto/base-admin-query.dto';
import { logger } from '@/common/util/logger';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private readonly deviceService: DevicesService,
    private readonly userProfileService: UserProfilesService
  ) {}

  @Cron('15 17 * * *', {
    timeZone: 'America/Edmonton'
  }) 
  async sendDailyNotifications() {
    logger.info('Starting daily notification broadcast at 9 AM Alberta time', {}, 'NotificationsService');
    
    try {
      const results = {
        success: true,
        sent: 0,
        failed: 0,
        details: []
      };

      // Send to all devices in the system
      await this.sendBroadcast(
        'Daily Update', 
        'Good morning! Here\'s your daily update from Mystyc.', 
        results, 
        'system'
      );

      logger.info('Daily notification broadcast completed', {
        sent: results.sent,
        failed: results.failed,
        totalDevices: results.sent + results.failed
      }, 'NotificationsService');

    } catch (error) {
      logger.error('Daily notification broadcast failed', {
        error: error.message
      }, 'NotificationsService');
    }
  }

  // GET Methods (Read Operations)

  /**
   * Finds notification by unique notification ID, returns null if not found
   * @param notificationId - MongoDB ObjectId as string
   * @returns Promise<NotificationInterface | null> - Notification if found, null if not found
   */
  async findById(notificationId: string): Promise<NotificationInterface | null> {
    logger.debug('Finding notification by ID', { notificationId }, 'NotificationsService');

    try {
      const notification = await this.notificationModel.findById(notificationId).exec();

      if (!notification) {
        logger.debug('Notification not found', { notificationId }, 'NotificationsService');
        return null;
      }

      logger.debug('Notification found', {
        notificationId,
        type: notification.type,
        status: notification.status
      }, 'NotificationsService');

      return this.transformToNotification(notification);
    } catch (error) {
      logger.error('Failed to find notification by ID', {
        notificationId,
        error: error.message
      }, 'NotificationsService');

      return null;
    }
  }

  /**
   * @returns number - Retrieves notification records total
   */
  async getTotal(): Promise<number> {
    return await this.notificationModel.countDocuments();
  }  

  /**
   * Retrieves notifications with pagination, sorting, and filtering (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<NotificationInterface[]> - Array of notifications with applied query params
   */
  async findAll(query: BaseAdminQueryDto): Promise<NotificationInterface[]> {
    const { limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    logger.debug('Finding notifications with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'NotificationsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const notifications = await this.notificationModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Notifications found', {
      count: notifications.length,
      limit,
      offset,
      sortBy,
      sortOrder
    }, 'NotificationsService');

    return notifications.map(notification => this.transformToNotification(notification));
  }

  /**
   * @param deviceId - Device id user unique identifier
   * @returns number - Retrieves notifications records total
   */
  async getTotalByDeviceId(deviceId: string): Promise<number> {
    return await this.notificationModel.countDocuments({ deviceId });
  }

  /**
   * Finds notifications by device Id
   * @param deviceId - Device ID string
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<NotificationInterface[]> - Array of notification records
   */
  async findByDeviceId(deviceId: string, query: BaseAdminQueryDto): Promise<NotificationInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    logger.debug('Finding device notifications with query', { 
      deviceId,
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'NotificationsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { deviceId } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const notifications = await this.notificationModel
      .aggregate(pipeline)
      .exec();

    logger.debug('Device notifications found', { 
      deviceId,
      count: notifications.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'NotificationsService');

    return notifications.map(notification => this.transformToNotification(notification));
  }

  /**
   * @param firebaseUid - Firebase user unique identifier
   * @returns number - Retrieves notifications records total
   */
  async getTotalByFirebaseUid(firebaseUid: string): Promise<number> {
    return await this.notificationModel.countDocuments({ firebaseUid });
  }

  /**
   * Retrieves user's notification records with pagination and sorting (admin use)
   * @param firebaseUid - Firebase user unique identifier
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<NotificationInterface[]> - Array of notification records with applied query params
   */
  async findByFirebaseUid(firebaseUid: string, query: BaseAdminQueryDto): Promise<NotificationInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    logger.debug('Finding user notifications with query', { 
      firebaseUid,
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'NotificationsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { firebaseUid } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const notifications = await this.notificationModel
      .aggregate(pipeline)
      .exec();

    logger.debug('User notifications found', { 
      firebaseUid,
      count: notifications.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'NotificationsService');

    return notifications.map(notification => this.transformToNotification(notification));
  }
  
  // POST/PUT/PATCH Methods (Write Operations)

  /**
   * Sends push notification via Firebase Cloud Messaging
   * @param token - FCM device token
   * @param title - Notification title
   * @param body - Notification body text
   * @param url - Deep link URL (defaults to main site)
   * @returns Promise<string> - Firebase message ID
   */
  async sendNotification(
    token: string, 
    title: string, 
    body: string, 
    url: string = "https://mystyc.app"
  ) {
    try {
      const message: admin.messaging.Message = {
        token,
        data: { 
          title,
          body,
          type: 'daily_horoscope', 
          url: url 
        },
        android: { 
          collapseKey: 'daily_horoscope', 
          priority: 'high', 
          ttl: 86_400_000 
        },
        apns: {
          headers: {
            'apns-push-type': 'background',
            'apns-priority': '5',
            'apns-expiration': `${Math.floor(Date.now()/1000)+86_400}`
          },
          payload: { aps: { 'content-available': 1 } }
        }
      };

      const response = await firebaseAdmin.messaging().send(message);
      logger.info('Notification sent successfully', { 
        messageId: response,
        token: token.substring(0, 20) + '...' 
      }, 'NotificationsService');
      
      return response;
    } catch (error) {
      logger.error('Failed to send notification', { 
        error: error.message,
        token: token.substring(0, 20) + '...' 
      }, 'NotificationsService');
      throw error;
    }
  }

  /**
   * Sends notification directly to a specific FCM token with tracking
   * @param token - FCM device token
   * @param title - Notification title
   * @param body - Notification body text
   * @param type - Notification type for tracking
   * @param sentBy - Firebase UID of sender
   * @param deviceId - Optional device ID for tracking
   * @returns Promise<{messageId: string, notificationId: string}> - Message and tracking IDs
   */
  async sendDirectTokenNotification(
    token: string,
    title: string,
    body: string,
    type: 'test' | 'admin' | 'broadcast',
    sentBy: string,
    deviceId?: string,
    deviceName?: string
  ): Promise<{ messageId: string; notificationId: string }> {
    // Create notification record for tracking
    const notification = await this.createNotificationRecord({
      firebaseUid: sentBy,
      deviceId,
      deviceName,
      fcmToken: token,
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

  /**
   * Sends notifications to various target types based on DTO configuration
   * @param adminFirebaseUid - Firebase UID of admin sending notification
   * @param sendNotificationDto - Configuration specifying targets and message content
   * @returns Promise with success status, counts, and detailed results
   * @throws BadRequestException when multiple or no target types specified
   */
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
      }, 'NotificationsService');

      return results;
    } catch (error) {
      logger.error('Notification batch failed', {
        adminUid: adminFirebaseUid,
        error: error.message
      }, 'NotificationsService');
      
      results.success = false;
      throw error;
    }
  }

  /**
   * Sends notification to a single device with result tracking
   * @param device - Device object with FCM token and metadata
   * @param title - Notification title
   * @param body - Notification body text
   * @param type - Notification type for tracking
   * @param sentBy - Firebase UID of sender
   * @param results - Results object to track success/failure counts
   */
  private async sendToSingleDevice(
    device: Device,
    title: string,
    body: string,
    type: 'test' | 'admin' | 'broadcast',
    sentBy: string,
    results: any
  ): Promise<void> {
    // Create notification record for tracking
    const notification = await this.createNotificationRecord({
      firebaseUid: device.firebaseUid,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      fcmToken: device.fcmToken,
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
        fcmToken: device.fcmToken.substring(0, 20) + '...',
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
        fcmToken: device.fcmToken.substring(0, 20) + '...',
        status: 'failed',
        error: error.message,
        notificationId: notification._id.toString()
      });
    }
  }

  /**
   * Sends notification to a specific device by device ID
   * @param deviceId - Unique device identifier
   * @param title - Notification title
   * @param body - Notification body text
   * @param results - Results object to track success/failure counts
   * @param type - Notification type for tracking
   * @param sentBy - Firebase UID of sender
   * @throws NotFoundException when device not found
   * @throws BadRequestException when device has no FCM token
   */
  async sendToDevice(
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

    await this.sendToSingleDevice(device, title, body, type, sentBy, results);
  }

  /**
   * Sends notification to all devices belonging to a specific user
   * @param firebaseUid - Firebase user unique identifier
   * @param title - Notification title
   * @param body - Notification body text
   * @param results - Results object to track success/failure counts
   * @param type - Notification type for tracking
   * @param sentBy - Firebase UID of sender
   * @throws NotFoundException when user not found or has no devices
   * @throws BadRequestException when user has no devices with FCM tokens
   */
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
      await this.sendToSingleDevice(device, title, body, type, sentBy, results);
    }
  }

  /**
   * Sends notification to all devices in the system with FCM tokens
   * @param title - Notification title
   * @param body - Notification body text
   * @param results - Results object to track success/failure counts
   * @param sentBy - Firebase UID of sender
   * @throws BadRequestException when no devices with FCM tokens found
   */
  private async sendBroadcast(
    title: string, 
    body: string, 
    results: any, 
    sentBy: string
  ): Promise<void> {
    // Get all devices with new query format
    const allDevices = await this.deviceService.findAll({ limit: 10000 });
    logger.info("[Notification Service] Found devices:" + allDevices.length);

    // Filter devices with FCM tokens
    const notifiableDevices = allDevices.filter(device => device.fcmToken);
    logger.info("[Notification Service] Notifyable devices:" + notifiableDevices.length);
    
    if (notifiableDevices.length === 0) {
      throw new BadRequestException('No devices with FCM tokens found in the system');
    }

    logger.info('Starting broadcast notification', {
      totalDevices: allDevices.length,
      notifiableDevices: notifiableDevices.length
    }, 'NotificationsService');

    for (const device of notifiableDevices) {
      await this.sendToSingleDevice(device, title, body, 'broadcast', sentBy, results);
    }
  }

  // Utility Methods

  /**
   * Creates a notification record in database for tracking
   * @param data - Notification data including recipient, content, and metadata
   * @returns Promise<NotificationDocument> - Saved notification document
   */
  private async createNotificationRecord(data: {
    firebaseUid: string;
    deviceId?: string;
    deviceName?: string;
    fcmToken?: string;
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

  /**
   * Updates notification status and metadata after send attempt
   * @param notificationId - MongoDB ObjectId as string
   * @param status - Final status after send attempt
   * @param messageId - Firebase message ID if successful
   * @param error - Error message if failed
   */
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

  /**
   * Transforms MongoDB document to clean NotificationInterface object
   * @param doc - MongoDB notification document
   * @returns NotificationInterface - Clean notification object without MongoDB metadata
   */
  private transformToNotification(doc: NotificationDocument): NotificationInterface {
    return {
      _id: doc._id.toString(),
      firebaseUid: doc.firebaseUid,
      deviceId: doc.deviceId,
      deviceName: doc.deviceName,
      fcmToken: doc.fcmToken,
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