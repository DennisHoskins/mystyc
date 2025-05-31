import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UAParser } from 'ua-parser-js';

import { Device, DeviceDocument } from './schemas/device.schema';
import { DeviceDto } from './dto/device.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { logger } from '@/util/logger';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>
  ) {}

  async upsertDevice(firebaseUid: string, deviceDto: DeviceDto): Promise<Device> {
    logger.info('Upserting device', {
      firebaseUid,
      deviceId: deviceDto.deviceId,
      platform: deviceDto.platform
    }, 'DeviceService');

    try {
      // Check if device exists with different user (security check)
      const existingDevice = await this.deviceModel.findOne({ 
        deviceId: deviceDto.deviceId 
      });

      if (existingDevice && existingDevice.firebaseUid !== firebaseUid) {
        logger.security('Device hijacking attempt detected', {
          deviceId: deviceDto.deviceId,
          originalOwner: existingDevice.firebaseUid,
          attemptedBy: firebaseUid
        });
        
        throw new ConflictException('Device is already registered to another user');
      }

      // Parse user agent
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

      // Upsert device
      const device = await this.deviceModel.findOneAndUpdate(
        { firebaseUid, deviceId: deviceDto.deviceId },
        {
          firebaseUid,
          deviceId: deviceDto.deviceId,
          platform: deviceDto.platform,
          fcmToken: deviceDto.fcmToken,
          appVersion: deviceDto.appVersion,
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
        isNew: !existingDevice || existingDevice.firebaseUid === firebaseUid,
        browser: userAgentParsed.browser.name,
        os: userAgentParsed.os.name
      }, 'DeviceService');

      return device.toObject();
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

  async updateFcmToken(firebaseUid: string, updateFcmTokenDto: UpdateFcmTokenDto): Promise<Device> {
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
        deviceId: device.deviceId
      }, 'DeviceService');

      return device.toObject();
    } catch (error) {
      logger.error('FCM token update failed', {
        firebaseUid,
        deviceId: updateFcmTokenDto.deviceId,
        error: error.message
      }, 'DeviceService');

      throw error;
    }
  }

  async findByFirebaseUid(firebaseUid: string): Promise<Device[]> {
    logger.debug('Finding devices by Firebase UID', { firebaseUid }, 'DeviceService');

    const devices = await this.deviceModel.find({ firebaseUid }).exec();

    logger.debug('Devices found', { 
      firebaseUid, 
      count: devices.length 
    }, 'DeviceService');

    return devices.map(device => device.toObject());
  }

  async findByDeviceId(deviceId: string): Promise<Device | null> {
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

    return device.toObject();
  }

  async findAll(): Promise<Device[]> {
    logger.debug('Finding all devices', {}, 'DeviceService');

    const devices = await this.deviceModel.find().exec();

    logger.debug('All devices retrieved', { count: devices.length }, 'DeviceService');

    return devices.map(device => device.toObject());
  }

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
}