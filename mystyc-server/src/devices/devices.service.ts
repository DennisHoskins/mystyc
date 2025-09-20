import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UAParser } from 'ua-parser-js';

import { Device as TDevice, DeviceInput, validateDeviceSafe, UpdateFcmToken } from 'mystyc-common/schemas';
import { BaseAdminQuery, BaseAdminQuerySchema, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { Device, DeviceDocument } from './schemas/device.schema';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  // GET Methods (Read Operations)

  /**
   * Finds device by MongoDB ID, returns null if not found (admin use)
   * @param id - MongoDB ObjectId as string
   * @returns Promise<TDevice | null> - Device record if found, null if not found
   */
  async findById(id: string): Promise<TDevice | null> {
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
        error
      }, 'DeviceService');

      return null;
    }
  }

  /**
   * Finds device by unique device ID, returns null if not found (service-level method)
   * @param deviceId - Unique device identifier
   * @returns Promise<TDevice | null> - Device record if found, null if not found
   */
  async findByDeviceId(deviceId: string): Promise<TDevice | null> {
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
   * @returns number - Retrieves device records with fcmToken total
   */
  async getTotalOnline(): Promise<number> {
    const pipeline = [
      { $match: { fcmToken: { $ne: null } } },
      { $group: { _id: '$deviceId' } },
      { $count: 'totalDevices' }
    ];
    
    const result = await this.deviceModel
      .aggregate(pipeline)
      .exec();
      
    return result[0]?.totalDevices || 0;
  }  

  /**
   * @returns number - Retrieves device records with no fcmToken total
   */
  async getTotalOffline(): Promise<number> {
    const pipeline = [
      { $match: { fcmToken: { $eq: null } } },
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
   * @returns Promise<TDevice[]> - Array of device records with applied query params
   */
  async findAll(queryRaw: Partial<BaseAdminQuery> = {}): Promise<TDevice[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
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
   * Retrieves device records with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<TDevice[]> - Array of device records with applied query params
   */
  async findByOnline(queryRaw: Partial<BaseAdminQuery> = {}): Promise<TDevice[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
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
      { $match: { fcmToken: { $ne: null } } },
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
   * Retrieves device records with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<TDevice[]> - Array of device records with applied query params
   */
  async findByOffline(queryRaw: Partial<BaseAdminQuery> = {}): Promise<TDevice[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
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
      { $match: { fcmToken: { $eq: null } } },
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
   * @returns Promise<TDevice[]> - Array of device records with applied query params
   */
  async findByFirebaseUid(
    firebaseUid: string, 
    queryRaw: BaseAdminQuery = { limit: 100, offset: 0, sortBy: 'createdAt', sortOrder: 'desc' }
  ): Promise<TDevice[]> {
    
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;

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

  async findByTimezoneWithFcmToken(timezone: string): Promise<TDevice[]> {
    logger.debug('Finding devices by timezone with FCM tokens', { timezone }, 'DeviceService');

    const pipeline: any[] = [
      {
        $match: {
          timezone: timezone,
          fcmToken: { $exists: true, $nin: [null, ''] }
        }
      },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: '$deviceId',
          doc: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$doc' } },
      { $limit: 5000 }
    ];

    const devices = await this.deviceModel.aggregate(pipeline).exec();
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
   * @returns Promise<TDevice> - Created or updated device record
   */
  async upsertDevice(firebaseUid: string, deviceDto: DeviceInput): Promise<TDevice> {
    logger.info('Upserting device', {
      firebaseUid,
      deviceId: deviceDto.deviceId,
      platform: deviceDto.platform
    }, 'DeviceService');

    try {

      const validation = validateDeviceSafe(deviceDto);
    if (!validation.success) {
      throw validation.error;
    }

      const validDevice = validation.data;      

      // Parse user agent to extract browser, OS, and device type information
      const parser = new UAParser(validDevice.userAgent);
      const userAgentParsed = parser.getResult();

      logger.debug('User agent parsed', {
        original: validDevice.userAgent?.substring(0, 100),
        parsed: {
          browser: userAgentParsed.browser.name,
          os: userAgentParsed.os.name,
          device: userAgentParsed.device.type
        }
      }, 'DeviceService');

      // Upsert device - creates new or updates existing device record
      const device = await this.deviceModel.findOneAndUpdate(
        { firebaseUid, deviceId: validDevice.deviceId },
        {
          firebaseUid,
          deviceId: validDevice.deviceId,
          deviceName: validDevice.deviceName,
          platform: validDevice.platform,
          appVersion: validDevice.appVersion,
          fcmToken: null,
          userAgent: validDevice.userAgent,
          userAgentParsed,
          timezone: validDevice.timezone,
          language: validDevice.language,
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
        error,
      }, 'DeviceService');

      throw error;
    }
  }

  /**
   * Updates device with FCM token to enable push notifications
   * Called after login when client obtains notification permission
   * @param firebaseUid - Firebase user unique identifier
   * @param updateFcmTokenDto - Device ID and new FCM token
   * @returns Promise<TDevice> - Updated device record with FCM token
   * @throws NotFoundException when device is not found
   */
  async updateFcmToken(firebaseUid: string, updateFcmTokenDto: UpdateFcmToken): Promise<TDevice> {
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
        error
      }, 'DeviceService');

      throw error;
    }
  }

  /**
   * Clears FCM token from device during logout to stop push notifications
   * @param firebaseUid - Firebase user unique identifier
   * @param logoutDto - Logout data containing device ID and timestamp
   * @returns Promise<TDevice> - Updated device record with cleared FCM token
   * @throws NotFoundException when device is not found
   */
  async logoutDevice(firebaseUid: string, deviceId: string, clientTimestamp: string): Promise<TDevice> {
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
        error
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
        error
      }, 'DeviceService');
    }
  }

  // Utility Methods

  /**
   * Transforms MongoDB document to clean TDevice object
   * @param doc - MongoDB device document
   * @returns TDevice - Clean device object without MongoDB metadata
   */
  private transformToDevice(doc: DeviceDocument): TDevice {
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

  /**
   * Get all unique device TimeZone strings
   * @returns Array of distinct device TimeZone strings
   */
  async getUniqueTimezones(): Promise<string[]> {
    return await this.deviceModel.distinct('timezone');
  }
}