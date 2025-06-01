import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AuthEvent, AuthEventDocument } from './schemas/auth-event.schema';
import { AuthEventData } from '@/common/interfaces/authEventData.interface';
import { logger } from '@/util/logger';

@Injectable()
export class AuthEventService {
  constructor(
    @InjectModel(AuthEvent.name) private authEventModel: Model<AuthEventDocument>
  ) {}

  async recordAuthEvent(
    firebaseUid: string, 
    authEventData: AuthEventData
  ): Promise<AuthEvent> {
    logger.info('Recording auth event', {
      firebaseUid,
      deviceId: authEventData.deviceId,
      type: authEventData.type,
      platform: authEventData.platform,
      ip: authEventData.ip
    }, 'AuthEventService');

    try {
      const authEvent = new this.authEventModel({
        firebaseUid,
        deviceId: authEventData.deviceId,
        type: authEventData.type,
        ip: authEventData.ip,
        platform: authEventData.platform,
        timestamp: new Date(), // Server UTC timestamp
        clientTimestamp: new Date(authEventData.clientTimestamp)
      });

      const savedEvent = await authEvent.save();

      logger.info('Auth event recorded successfully', {
        firebaseUid,
        deviceId: authEventData.deviceId,
        type: authEventData.type,
        eventId: savedEvent._id.toString(),
        serverTime: savedEvent.timestamp,
        clientTime: savedEvent.clientTimestamp
      }, 'AuthEventService');

      return savedEvent.toObject();
    } catch (error) {
      logger.error('Auth event recording failed', {
        firebaseUid,
        deviceId: authEventData.deviceId,
        type: authEventData.type,
        error: error.message,
        code: error.code
      }, 'AuthEventService');

      throw error;
    }
  }

  async findByFirebaseUid(
    firebaseUid: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<AuthEvent[]> {
    logger.debug('Finding auth events by Firebase UID', {
      firebaseUid,
      limit,
      offset
    }, 'AuthEventService');

    const events = await this.authEventModel
      .find({ firebaseUid })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Auth events found', {
      firebaseUid,
      count: events.length,
      limit,
      offset
    }, 'AuthEventService');

    return events.map(event => event.toObject());
  }

  async findByDeviceId(
    deviceId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<AuthEvent[]> {
    logger.debug('Finding auth events by device ID', {
      deviceId,
      limit,
      offset
    }, 'AuthEventService');

    const events = await this.authEventModel
      .find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Auth events found', {
      deviceId,
      count: events.length,
      limit,
      offset
    }, 'AuthEventService');

    return events.map(event => event.toObject());
  }

  async findByType(
    type: 'login' | 'logout' | 'create',
    limit: number = 50,
    offset: number = 0
  ): Promise<AuthEvent[]> {
    logger.debug('Finding auth events by type', {
      type,
      limit,
      offset
    }, 'AuthEventService');

    const events = await this.authEventModel
      .find({ type })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Auth events found', {
      type,
      count: events.length,
      limit,
      offset
    }, 'AuthEventService');

    return events.map(event => event.toObject());
  }

  async findWithFilters(
    filters: {
      firebaseUid?: string;
      deviceId?: string;
      type?: 'login' | 'logout' | 'create';
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 50,
    offset: number = 0
  ): Promise<AuthEvent[]> {
    logger.debug('Finding auth events with filters', {
      filters,
      limit,
      offset
    }, 'AuthEventService');

    const query: any = {};

    if (filters.firebaseUid) {
      query.firebaseUid = filters.firebaseUid;
    }

    if (filters.deviceId) {
      query.deviceId = filters.deviceId;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.timestamp.$lte = filters.endDate;
      }
    }

    const events = await this.authEventModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Filtered auth events found', {
      filters,
      count: events.length,
      limit,
      offset
    }, 'AuthEventService');

    return events.map(event => event.toObject());
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<AuthEvent[]> {
    logger.debug('Finding all auth events', { limit, offset }, 'AuthEventService');

    const events = await this.authEventModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('All auth events retrieved', {
      count: events.length,
      limit,
      offset
    }, 'AuthEventService');

    return events.map(event => event.toObject());
  }

  async getRecentAuthEvent(firebaseUid: string): Promise<AuthEvent | null> {
    logger.debug('Getting most recent auth event', { firebaseUid }, 'AuthEventService');

    const event = await this.authEventModel
      .findOne({ firebaseUid })
      .sort({ timestamp: -1 })
      .exec();

    if (!event) {
      logger.debug('No auth events found', { firebaseUid }, 'AuthEventService');
      return null;
    }

    logger.debug('Recent auth event found', {
      firebaseUid,
      eventId: event._id.toString(),
      type: event.type,
      timestamp: event.timestamp
    }, 'AuthEventService');

    return event.toObject();
  }

  async findById(eventId: string): Promise<AuthEvent | null> {
    logger.debug('Finding auth event by ID', { eventId }, 'AuthEventService');

    try {
      const event = await this.authEventModel.findById(eventId).exec();

      if (!event) {
        logger.debug('Auth event not found', { eventId }, 'AuthEventService');
        return null;
      }

      logger.debug('Auth event found', {
        eventId,
        firebaseUid: event.firebaseUid,
        deviceId: event.deviceId,
        type: event.type
      }, 'AuthEventService');

      return event.toObject();
    } catch (error) {
      logger.error('Failed to find auth event by ID', {
        eventId,
        error: error.message
      }, 'AuthEventService');

      return null;
    }
  }

  async deleteAll(): Promise<number> {
    logger.warn('Deleting all auth events', {}, 'AuthEventService');
    
    const result = await this.authEventModel.deleteMany({});
    
    logger.warn('All auth events deleted', { 
      deletedCount: result.deletedCount 
    }, 'AuthEventService');
    
    return result.deletedCount || 0;
  }
}