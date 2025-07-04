import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UAParser } from 'ua-parser-js';

import { Device, DeviceDocument } from './schemas/device.schema';
import { Device as DeviceInterface } from '@/common/interfaces/device.interface';
import { DeviceDto } from './dto/device.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { BaseAdminQueryDto } from '@/admin/dto/base-admin-query.dto';
import { logger } from '@/common/util/logger';
import { AuthEventLogoutDto } from '@/auth-events/dto/auth-event-logout.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  // GET Methods (Read Operations)

  /**
   * Finds device by MongoDB ID, returns null if not found (admin use)
   * @param id - MongoDB ObjectId as string
   * @returns Promise<DeviceInterface | null> - Device record if found, null if not found
   */
  async findById(id: string): Promise<DeviceInterface | null> {
    logger.debug('Finding device by ID', { id }, 'DeviceService');

    try {
      const device = await this.deviceModel.findById(id).exec();

      if (!device) {
        logger.debug('Device not found', { id }, 'DeviceService');
        return null;
      }

      logger.debug('Device found', {
        id,
        deviceId: device.deviceId,
      }, 'DeviceService');

      return this.transformToDevice(device);
    } catch (error) {
      logger.error('Failed to find device by ID', {
        id,
        error: error.message
      }, 'DeviceService');

      return null;
    }
  }

  /**
   * Finds device by unique device ID, returns null if not found (service-level method)
   * @param deviceId - Unique device identifier
   * @returns Promise<DeviceInterface | null> - Device record if found, null if not found
   */
  async findByDeviceId(deviceId: string): Promise<DeviceInterface | null> {
    logger.debug('Finding device by device ID', { deviceId }, 'DeviceService');

    const device = await this.deviceModel.findOne({ deviceId }).exec();

    if (!device) {
      logger.debug('Device not found', { deviceId }, 'DeviceService');
      return null;
    }

    logger.debug('Device found', { 
      deviceId, 
      firebaseUid: device.firebaseUid 
    }, 'DeviceService');

    return this.transformToDevice(device);
  }

  /**
   * @returns number - Retrieves device records total
   */
  async getTotal(): Promise<number> {
    const pipeline = [
      { $group: { _id: '$deviceId' } },
      { $count: 'totalDevices' }
    ];
    
    const result = await this.deviceModel
      .aggregate(pipeline)
      .exec();
      
    return result[0]?.totalDevices || 0;
  }  

  /**
   * Retrieves device records with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<DeviceInterface[]> - Array of device records with applied query params
   */
  async findAll(query: BaseAdminQueryDto): Promise<DeviceInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    logger.debug('Finding devices with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'DeviceService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $sort: sortObj },
      { $group: { _id: '$deviceId', doc: { $first: '$$ROOT' } } }, 
      { $replaceRoot: { newRoot: '$doc' } },
      { $skip: offset },
      { $limit: limit },
    ];

    const devices = await this.deviceModel.
      aggregate(pipeline)
      .exec();

    logger.debug('Devices found', { 
      count: devices.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'DeviceService');

    return devices.map(device => this.transformToDevice(device));
  }

  /**
   * @param firebaseUid - Firebase user unique identifier
   * @returns number - Retrieves device records total
   */
  async getTotalByFirebaseUid(firebaseUid: string): Promise<number> {
    const pipeline = [
      { $match: { firebaseUid } },
      { $group: { _id: '$deviceId' } },
      { $count: 'totalDevices' }
    ];
    
    const result = await this.deviceModel
      .aggregate(pipeline)
      .exec();
      
    return result[0]?.totalDevices || 0;
  }

  /**
   * Retrieves user's device records with pagination and sorting (admin use)
   * @param firebaseUid - Firebase user unique identifier
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<DeviceInterface[]> - Array of device records with applied query params
   */
  async findByFirebaseUid(firebaseUid: string, query: BaseAdminQueryDto = {}): Promise<DeviceInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    logger.debug('Finding user devices with query', { 
      firebaseUid,
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'DeviceService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { firebaseUid } },
      { $sort: sortObj },
      { $group: { _id: '$deviceId', doc: { $first: '$$ROOT' } } }, 
      { $replaceRoot: { newRoot: '$doc' } },
      { $skip: offset },
      { $limit: limit },
    ];

    const devices = await this.deviceModel
      .aggregate(pipeline)
      .exec();

    logger.debug('User Devices found', { 
      firebaseUid,
      count: devices.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'DeviceService');

    return devices.map(device => this.transformToDevice(device));
  }  

  /**
   * Get unique firebaseUids that have used a specific device
   * @param deviceId - Device identifier
   * @returns Promise<string[]> - Array of unique firebaseUids
   */
  async getFirebaseUidsByDeviceId(deviceId: string): Promise<string[]> {
    return await this.deviceModel.distinct('firebaseUid', { deviceId });
  }

  async getTotalUsersByDeviceId(deviceId: string): Promise<number> {
    const uniqueFirebaseUids = await this.getFirebaseUidsByDeviceId(deviceId);
    return uniqueFirebaseUids.length;
  }  

  // POST/PUT/PATCH Methods (Write Operations)

  /**
   * Creates or updates device record during login without FCM token
   * Parses user agent and stores device metadata for tracking and analytics
   * @param firebaseUid - Firebase user unique identifier
   * @param deviceDto - Complete device information from client
   * @returns Promise<DeviceInterface> - Created or updated device record
   */
  async upsertDevice(firebaseUid: string, deviceDto: DeviceDto): Promise<DeviceInterface> {
    logger.info('Upserting device', {
      firebaseUid,
      deviceId: deviceDto.deviceId,
      platform: deviceDto.platform
    }, 'DeviceService');

    try {
      // Parse user agent to extract browser, OS, and device type information
      const parser = new UAParser(deviceDto.userAgent);
      const userAgentParsed = parser.getResult();

      logger.debug('User agent parsed', {
        original: deviceDto.userAgent.substring(0, 100),
        parsed: {
          browser: userAgentParsed.browser.name,
          os: userAgentParsed.os.name,
          device: userAgentParsed.device.type
        }
      }, 'DeviceService');

      // Upsert device - creates new or updates existing device record
      const device = await this.deviceModel.findOneAndUpdate(
        { firebaseUid, deviceId: deviceDto.deviceId },
        {
          firebaseUid,
          deviceId: deviceDto.deviceId,
          deviceName: deviceDto.deviceName,
          platform: deviceDto.platform,
          appVersion: deviceDto.appVersion,
          fcmToken: null,
          userAgent: deviceDto.userAgent,
          userAgentParsed,
          timezone: deviceDto.timezone,
          language: deviceDto.language,
          updatedAt: new Date()
        },
        { 
          new: true, 
          upsert: true,
          runValidators: true 
        }
      );

      logger.info('Device upserted successfully', {
        firebaseUid,
        deviceId: device.deviceId,
        browser: userAgentParsed.browser.name,
        os: userAgentParsed.os.name,
      }, 'DeviceService');

      return this.transformToDevice(device);
    } catch (error) {
      logger.error('Device upsert failed', {
        firebaseUid,
        deviceId: deviceDto.deviceId,
        error: error.message,
        code: error.code
      }, 'DeviceService');

      throw error;
    }
  }

  /**
   * Updates device with FCM token to enable push notifications
   * Called after login when client obtains notification permission
   * @param firebaseUid - Firebase user unique identifier
   * @param updateFcmTokenDto - Device ID and new FCM token
   * @returns Promise<DeviceInterface> - Updated device record with FCM token
   * @throws NotFoundException when device is not found
   */
  async updateFcmToken(firebaseUid: string, updateFcmTokenDto: UpdateFcmTokenDto): Promise<DeviceInterface> {
    logger.info('Updating FCM token', {
      firebaseUid,
      deviceId: updateFcmTokenDto.deviceId
    }, 'DeviceService');

    try {
      const device = await this.deviceModel.findOneAndUpdate(
        { 
          firebaseUid, 
          deviceId: updateFcmTokenDto.deviceId 
        },
        {
          fcmToken: updateFcmTokenDto.fcmToken,
          fcmTokenUpdatedAt: new Date(),
          updatedAt: new Date()
        },
        { 
          new: true,
          runValidators: true 
        }
      );

      if (!device) {
        logger.warn('FCM token update failed - device not found', {
          firebaseUid,
          deviceId: updateFcmTokenDto.deviceId
        }, 'DeviceService');
        
        throw new NotFoundException('Device not found');
      }

      logger.info('FCM token updated successfully', {
        firebaseUid,
        deviceId: device.deviceId,
      }, 'DeviceService');

      return this.transformToDevice(device);
    } catch (error) {
      logger.error('FCM token update failed', {
        firebaseUid,
        deviceId: updateFcmTokenDto.deviceId,
        error: error.message
      }, 'DeviceService');

      throw error;
    }
  }

  /**
   * Clears FCM token from device during logout to stop push notifications
   * @param firebaseUid - Firebase user unique identifier
   * @param logoutDto - Logout data containing device ID and timestamp
   * @returns Promise<DeviceInterface> - Updated device record with cleared FCM token
   * @throws NotFoundException when device is not found
   */
  async logoutDevice(firebaseUid: string, deviceId: string, clientTimestamp: string): Promise<DeviceInterface> {
    logger.info('Clearing FCM token', {
      firebaseUid,
      deviceId: deviceId
    }, 'DeviceService');

    try {
      const device = await this.deviceModel.findOneAndUpdate(
        { 
          firebaseUid, 
          deviceId: deviceId 
        },
        {
          fcmToken: null,
          updatedAt: new Date()
        },
        { 
          new: true,
          runValidators: true 
        }
      );

      if (!device) {
        logger.warn('Clear FCM token update failed - device not found', {
          firebaseUid,
          deviceId
        }, 'DeviceService');
        
        throw new NotFoundException('Device not found');
      }

      logger.info('FCM token cleared successfully', {
        firebaseUid,
        deviceId,
      }, 'DeviceService');

      return this.transformToDevice(device);
    } catch (error) {
      logger.error('FCM token update failed', {
        firebaseUid,
        deviceId: deviceId,
        error: error.message
      }, 'DeviceService');

      throw error;
    }
  }

  /**
   * Removes invalid FCM token when push notification delivery fails
   * Called by notification service when FCM returns invalid token error
   * @param deviceId - Unique device identifier
   * @returns Promise<void>
   */
  async removeInvalidFcmToken(deviceId: string): Promise<void> {
    logger.info('Removing invalid FCM token', { deviceId }, 'DeviceService');

    try {
      await this.deviceModel.findOneAndUpdate(
        { deviceId },
        { 
          $unset: { fcmToken: 1 },
          updatedAt: new Date()
        }
      );

      logger.info('Invalid FCM token removed', { deviceId }, 'DeviceService');
    } catch (error) {
      logger.error('Failed to remove invalid FCM token', {
        deviceId,
        error: error.message
      }, 'DeviceService');
    }
  }

  // Utility Methods

  /**
   * Transforms MongoDB document to clean DeviceInterface object
   * @param doc - MongoDB device document
   * @returns DeviceInterface - Clean device object without MongoDB metadata
   */
  private transformToDevice(doc: DeviceDocument): DeviceInterface {
    return {
      firebaseUid: doc.firebaseUid,
      deviceId: doc.deviceId,
      deviceName: doc.deviceName,
      platform: doc.platform,
      timezone: doc.timezone,
      language: doc.language,
      userAgent: doc.userAgent,
      userAgentParsed: doc.userAgentParsed,
      fcmToken: doc.fcmToken,
      fcmTokenUpdatedAt: doc.fcmTokenUpdatedAt,
      appVersion: doc.appVersion,
    };
  }
}