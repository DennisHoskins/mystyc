import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as admin from 'firebase-admin';

import { firebaseAdmin } from '@/auth/firebase-admin.provider';
import { DevicesService } from '@/devices/devices.service';
import { UserProfilesService } from '@/users/user-profiles.service';
import { NotificationContentService, NotificationContentTimeoutError } from '@/content/notification-content.service';
import { ScheduleExecutionsService } from '@/schedules/schedule-executions.service';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { Notification as NotificationInterface } from '@/common/interfaces/notification.interface';
import { Device } from '@/common/interfaces/device.interface';
import { BaseAdminQueryDto } from '@/admin/dto/base-admin-query.dto';
import { logger } from '@/common/util/logger';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private readonly deviceService: DevicesService,
    private readonly userProfileService: UserProfilesService,
    private readonly notificationContentService: NotificationContentService,
    private readonly scheduleExecutionService: ScheduleExecutionsService
  ) {}

  // Notification schedule methods

  /**
   * Handles scheduled notification sending events from Schedule Service
   * Generates content once, then sends to timezone
   */
  @OnEvent('notifications.send.notification')
  async handleScheduledNotifications(payload: any): Promise<void> {
    logger.info('Handling scheduled notifications', {
      scheduleId: payload.scheduleId,
      executionId: payload.executionId,
      eventName: payload.eventName,
      timezone: payload.timezone || 'global',
      scheduledTime: payload.scheduledTime,
      executedAt: payload.executedAt,
    }, 'NotificationsService');

    const startTime = Date.now();

    try {
      const results = {
        success: true,
        sent: 0,
        failed: 0,
        details: []
      };


      // Generate content once
      const { title, body, fullContent } = await this.notificationContentService.getNotificationData(payload.scheduleId, payload.executionId);
      const url = 'https://mystyc.app';

      if (payload.timezone) {
        // Send to devices in specific timezone
        await this.sendScheduleNotificationsToTimezone(
          title, 
          body, 
          url, 
          payload.timezone, 
          payload.scheduleId, 
          payload.executionId, 
          fullContent._id,
          results
        );
      } else {
        // Send broadcast to all devices
        await this.sendScheduleNotificationsBroadcast(
          title,
          body,
          url,
          payload.scheduleId, 
          payload.executionId, 
          fullContent._id,
          results, 
          'system'
        );
      }

      logger.info('Scheduled notifications completed', {
        scheduleId: payload.scheduleId,
        executionId: payload.executionId,
        timezone: payload.timezone || 'global',
        sent: results.sent,
        failed: results.failed,
        totalAttempts: results.sent + results.failed,
      }, 'NotificationsService');

      // tell schedule execution it succeeded
      const duration = Date.now() - startTime; 
      await this.scheduleExecutionService.updateStatus(payload.executionId, 'completed', undefined, duration);        
    } catch (err) {
      const duration = Date.now() - startTime;

      const error = err instanceof Error ? err : new Error(String(err));
      
      // Check if this is a timeout error from content generation
      if (error instanceof NotificationContentTimeoutError || error.name === 'NotificationContentTimeoutError') {
        logger.warn('Scheduled notifications timed out during content generation', {
          scheduleId: payload.scheduleId,
          executionId: payload.executionId,
          timezone: payload.timezone || 'global',
          error,
          duration,
          scheduledTime: payload.scheduledTime,
        }, 'NotificationsService');

        await this.scheduleExecutionService.updateStatus(payload.executionId, 'timeout', error.message, duration);
      } else {
        logger.error('Scheduled notifications failed', {
          scheduleId: payload.scheduleId,
          executionId: payload.executionId,
          timezone: payload.timezone || 'global',
          error,
          duration,
          scheduledTime: payload.scheduledTime,
        }, 'NotificationsService');

        await this.scheduleExecutionService.updateStatus(payload.executionId, 'failed', error.message, duration);
      }
      
      // Don't throw - we don't want to crash the scheduler
    }
  }

  /**
   * Handles scheduled notification update sending events from Schedule Service
   * Generates updated content once, then sends to timezone
   */
  @OnEvent('notifications.send.update')
  async handleScheduledUpdates(payload: any): Promise<void> {
    logger.info('Handling scheduled notification updates', {
      scheduleId: payload.scheduleId,
      executionId: payload.executionId,
      eventName: payload.eventName,
      timezone: payload.timezone || 'global',
      scheduledTime: payload.scheduledTime,
      executedAt: payload.executedAt,
    }, 'NotificationsService');

    const startTime = Date.now();

    try {
      const results = {
        success: true,
        sent: 0,
        failed: 0,
        details: []
      };

      // Generate updated content once
      const { title, body, fullContent } = await this.notificationContentService.getNotificationData(payload.scheduleId, payload.executionId);
      const url = 'https://mystyc.app';

      if (payload.timezone) {
        // Send to devices in specific timezone
        await this.sendScheduleNotificationsToTimezone(
          title, 
          body, 
          url, 
          payload.timezone, 
          payload.scheduleId, 
          payload.executionId, 
          fullContent._id,
          results
        );
      } else {
        // Send broadcast to all devices
        await this.sendScheduleNotificationsBroadcast(
          title,
          body,
          url,
          payload.scheduleId, 
          payload.executionId, 
          fullContent._id,
          results, 
          'system'
        );
      }

      logger.info('Scheduled notification updates completed', {
        scheduleId: payload.scheduleId,
        executionId: payload.executionId,
        timezone: payload.timezone || 'global',
        sent: results.sent,
        failed: results.failed,
        totalAttempts: results.sent + results.failed,
      }, 'NotificationsService');

      // tell schedule execution it succeeded
      const duration = Date.now() - startTime; 
      await this.scheduleExecutionService.updateStatus(payload.executionId, 'completed', undefined, duration);        
    } catch (err) {
      const duration = Date.now() - startTime;

      const error = err instanceof Error ? err : new Error(String(err));
  
    // Check if this is a timeout error from content generation
      if (error instanceof NotificationContentTimeoutError || error.name === 'NotificationContentTimeoutError') {
        logger.warn('Scheduled notifications timed out during content generation', {
        scheduleId: payload.scheduleId,
        executionId: payload.executionId,
        timezone: payload.timezone || 'global',
        error,
        duration,
        scheduledTime: payload.scheduledTime,
      }, 'NotificationsService');

      await this.scheduleExecutionService.updateStatus(payload.executionId, 'timeout', error.message, duration);
    } else {
      logger.error('Scheduled notifications failed', {
        scheduleId: payload.scheduleId,
        executionId: payload.executionId,
        timezone: payload.timezone || 'global',
        error,
        duration,
        scheduledTime: payload.scheduledTime,
      }, 'NotificationsService');

      await this.scheduleExecutionService.updateStatus(payload.executionId, 'failed', error.message, duration);
    }
    
    // Don't throw - we don't want to crash the scheduler
  }
  }

  /**
   * Sends notifications to devices in a specific timezone
   * Accepts content as parameters, no content generation
   */
  private async sendScheduleNotificationsToTimezone(
    title: string,
    body: string,
    url: string,
    timezone: string, 
    scheduleId?: string,
    executionId?: string,
    contentId?: string,
    results?: any,
  ): Promise<void> {
    logger.info('Sending notifications to timezone', { 
      timezone, 
      scheduleId,
      executionId,
      contentId
    }, 'NotificationsService');

    try {
      // Get all devices with pagination (adjust limit as needed)
      const timezoneDevices = await this.deviceService.findByTimezoneWithFcmToken(timezone);

      logger.info('Found target devices for timezone', {
        timezone,
        scheduleId,
        executionId,
        contentId,
        timezoneDevices: timezoneDevices.length
      }, 'NotificationsService');

      if (timezoneDevices.length === 0) {
        logger.warn('No devices found for timezone', { timezone, scheduleId, executionId }, 'NotificationsService');
        return;
      }

      // Send notifications to filtered devices
      for (const device of timezoneDevices) {
        await this.sendToDevice(
          device,
          title,
          body,
          url,
          'schedule',
          'system',
          scheduleId,
          executionId,
          contentId,
          results
        );
      }

    } catch (error) {
      logger.error('Failed to send notifications to timezone', {
        timezone,
        scheduleId,
        executionId,
        contentId,
        error
      }, 'NotificationsService');
      throw error;
    }
  }

  /**
   * Sends notification to all devices in the system with FCM tokens
   * Accepts content as parameters, no content generation
   */
  private async sendScheduleNotificationsBroadcast(
    title: string,
    body: string,
    url: string,
    scheduleId?: string,
    executionId?: string,
    contentId?: string,
    results?: any, 
    sentBy?: string
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
      notifiableDevices: notifiableDevices.length,
      scheduleId,
      executionId,
      contentId
    }, 'NotificationsService');

    for (const device of notifiableDevices) {
      await this.sendToDevice(
        device,
        title,
        body,
        url,
        'broadcast',
        sentBy || 'system',
        scheduleId,
        executionId,
        contentId,
        results
      );
    }
  }

  private async sendToUserDevices(
    firebaseUid: string, 
    title: string, 
    body: string, 
    results: any, 
    type: 'test' | 'admin' | 'broadcast' | 'schedule',
    sentBy: string,
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
      await this.sendToDevice(device, title, body, 'https://mystyc.app', type, sentBy, undefined, undefined, results);
    }
  }

  /**
   * Sends notification to a single device
   * Consolidated method that accepts content as parameters
   */
  async sendToDevice(
    device: Device,
    title: string,
    body: string,
    url: string,
    type: 'test' | 'admin' | 'broadcast' | 'schedule',
    sentBy: string,
    scheduleId?: string | null,
    executionId?: string | null,
    contentId?: string | null,
    results?: any,
  ): Promise<void> {
    if (!device.fcmToken) {
      throw new BadRequestException('Device does not have FCM token - notifications not enabled');
    }

    const notification = await this.createNotificationRecord({
      firebaseUid: device.firebaseUid,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      fcmToken: device.fcmToken,
      title: title,
      body: body,
      type,
      sentBy,
      scheduleId,
      executionId,
      contentId
    });

    const notificationId = notification._id.toString();

    try {
      const messageId = await this.sendNotification(device.deviceId, device.fcmToken, title, body, url);
      
      await this.updateNotificationStatus(notificationId, 'sent', messageId);
      
      if (results) {
        results.sent += 1;
        results.details.push({
          deviceId: device.deviceId,
          firebaseUid: device.firebaseUid,
          fcmToken: device.fcmToken.substring(0, 20) + '...',
          status: 'sent',
          messageId,
          notificationId,
          scheduleId,
          executionId,
          contentId
        });
      }

      logger.debug('Notification sent successfully', {
        notificationId,
        deviceId: device.deviceId,
        title: title.substring(0, 50) + '...'
      }, 'NotificationsService');

    } catch (err) {
      // Update notification as failed
      const error = err instanceof Error ? err : new Error(String(err));

      await this.updateNotificationStatus(notificationId, 'failed', undefined, error.message);
      
      if (results) {
        results.failed += 1;
        results.details.push({
          deviceId: device.deviceId,
          firebaseUid: device.firebaseUid,
          fcmToken: device.fcmToken.substring(0, 20) + '...',
          status: 'failed',
          error,
          notificationId,
          scheduleId,
          executionId,
          contentId
        });
      }

      logger.error('Notification failed', {
        notificationId,
        deviceId: device.deviceId,
        error
      }, 'NotificationsService');
    }
  }

  // GET methods

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
        error
      }, 'NotificationsService');

      return null;
    }
  }

  async getTotal(): Promise<number> {
    return await this.notificationModel.countDocuments();
  }  

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

 async getTotalByDeviceId(deviceId: string): Promise<number> {
    return await this.notificationModel.countDocuments({ deviceId });
  }

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

  async getTotalByFirebaseUid(firebaseUid: string): Promise<number> {
    return await this.notificationModel.countDocuments({ firebaseUid });
  }

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

  async getTotalByScheduleId(scheduleId: string): Promise<number> {
    return await this.notificationModel.countDocuments({ scheduleId });
  }

  async findByScheduleId(scheduleId: string, query: BaseAdminQueryDto): Promise<NotificationInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    logger.debug('Finding schedule notifications with query', {
      scheduleId,
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'NotificationsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { scheduleId } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const notifications = await this.notificationModel
      .aggregate(pipeline)
      .exec();

    logger.debug('Schedule notifications found', {
      scheduleId,
      count: notifications.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'NotificationsService');

    return notifications.map(notification => this.transformToNotification(notification));
  }

  async getTotalByExecutionId(executionId: string): Promise<number> {
    return await this.notificationModel.countDocuments({ executionId });
  }

  async findByExecutionId(executionId: string, query: BaseAdminQueryDto): Promise<NotificationInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    logger.debug('Finding schedule execution notifications with query', {
      executionId,
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'NotificationsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { executionId } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const notifications = await this.notificationModel
      .aggregate(pipeline)
      .exec();

    logger.debug('Schedule execution notifications found', {
      executionId,
      count: notifications.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'NotificationsService');

    return notifications.map(notification => this.transformToNotification(notification));
  }

  // POST/PUT/PATCH Methods (Write Operations)

  async sendNotification(
    deviceId: string,
    token: string,
    title: string,
    body: string,
    url: string = 'https://mystyc.app'
  ) {
    const message: admin.messaging.Message = {
      token,
      data: {
        title,
        body,
        url,
        icon: '/favicon/favicon.ico',
        badge: '/favicon/favicon.ico',
        messageId: Date.now().toString()
      },
      webpush: {
        headers: {
          Urgency: 'high',
          TTL: '86400'
        }
      }
    };

    try {
      return await firebaseAdmin.messaging().send(message);
    } catch (err: any) {
      logger.error(`[sendNotification] Error sending to ${token}:`, err.code);
      if (err.code === 'messaging/registration-token-not-registered') {
        // remove stale token
        await this.deviceService.removeInvalidFcmToken(deviceId)
        logger.info(`[sendNotification] Deleted stale FCM token: ${token}`);
        return;
      }
      throw err;
    }
  }

  /**
   * Creates a notification record in database for tracking
   * Returns the saved document so we can get the _id
   */
  private async createNotificationRecord(data: {
    firebaseUid: string;
    deviceId?: string;
    deviceName?: string;
    fcmToken?: string;
    title: string;
    body: string;
    type: 'test' | 'admin' | 'broadcast' | 'schedule';
    sentBy: string;
    scheduleId?: string | null;
    executionId?: string | null;
    contentId?: string | null;
  }): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      ...data,
      source: 'api',
      status: 'pending'
    });

    const saved = await notification.save();
    
    logger.debug('Notification record created', {
      notificationId: saved._id.toString(),
      type: data.type,
      deviceId: data.deviceId
    }, 'NotificationsService');

    return saved;
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
      scheduleId: doc.scheduleId,
      executionId: doc.executionId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}