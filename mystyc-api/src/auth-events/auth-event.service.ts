import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AuthEvent, AuthEventDocument } from './schemas/auth-event.schema';
import { AuthEvent as AuthEventInterface } from '@/common/interfaces/authEvent.interface';
import { BaseAdminQueryDto } from '@/admin/dto/base-admin-query.dto';
import { logger } from '@/common/util/logger';

@Injectable()
export class AuthEventService {
  constructor(
    @InjectModel(AuthEvent.name) private authEventModel: Model<AuthEventDocument>
  ) {}

  // GET Methods (Read Operations)

  /**
   * Finds auth event by unique event ID, returns null if not found
   * @param eventId - MongoDB ObjectId as string
   * @returns Promise<AuthEventInterface | null> - Auth event if found, null if not found
   */
  async findById(eventId: string): Promise<AuthEventInterface | null> {
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

      return this.transformToAuthEvent(event);
    } catch (error) {
      logger.error('Failed to find auth event by ID', {
        eventId,
        error: error.message
      }, 'AuthEventService');

      return null;
    }
  }

  /**
   * Finds all auth events for a specific user with pagination
   * @param firebaseUid - Firebase user unique identifier
   * @param limit - Maximum number of events to return (default: 50)
   * @param offset - Number of events to skip (default: 0)
   * @returns Promise<AuthEventInterface[]> - Array of user's auth events, newest first
   */
  async findByFirebaseUid(
    firebaseUid: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<AuthEventInterface[]> {
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

    return events.map(event => this.transformToAuthEvent(event));
  }

  /**
   * Finds all auth events for a specific device with pagination
   * @param deviceId - Unique device identifier
   * @param limit - Maximum number of events to return (default: 50)
   * @param offset - Number of events to skip (default: 0)
   * @returns Promise<AuthEventInterface[]> - Array of device's auth events, newest first
   */
  async findByDeviceId(
    deviceId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<AuthEventInterface[]> {
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

    return events.map(event => this.transformToAuthEvent(event));
  }

  /**
   * Retrieves auth events with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<AuthEventInterface[]> - Array of auth events with applied query params
   */
  async findAll(query: BaseAdminQueryDto): Promise<AuthEventInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'timestamp', sortOrder = 'desc' } = query;
    
    logger.debug('Finding auth events with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'AuthEventService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const events = await this.authEventModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Auth events found', {
      count: events.length,
      limit,
      offset,
      sortBy,
      sortOrder
    }, 'AuthEventService');

    return events.map(event => this.transformToAuthEvent(event));
  }

  // POST/PUT/PATCH Methods (Write Operations)

  /**
   * Records a new authentication event (login, logout, create)
   * @param authEventData - Auth event data with firebaseUid, deviceId, type, ip, clientTimestamp
   * @returns Promise<AuthEventInterface> - Saved auth event record
   */
  async recordAuthEvent(authEventData: AuthEventInterface): Promise<AuthEventInterface> {
    logger.info('Recording auth event', {
      firebaseUid: authEventData.firebaseUid,
      deviceId: authEventData.deviceId,
      type: authEventData.type,
      ip: authEventData.ip
    }, 'AuthEventService');

    try {
      const authEvent = new this.authEventModel({
        firebaseUid: authEventData.firebaseUid,
        deviceId: authEventData.deviceId,
        type: authEventData.type,
        ip: authEventData.ip,
        timestamp: new Date(), // Server timestamp
        clientTimestamp: new Date(authEventData.clientTimestamp)
      });

      const savedEvent = await authEvent.save();

      logger.info('Auth event recorded successfully', {
        firebaseUid: authEventData.firebaseUid,
        deviceId: authEventData.deviceId,
        type: authEventData.type,
        eventId: savedEvent._id.toString(),
        serverTime: savedEvent.timestamp,
        clientTime: savedEvent.clientTimestamp
      }, 'AuthEventService');

      return this.transformToAuthEvent(savedEvent);
    } catch (error) {
      logger.error('Auth event recording failed', {
        firebaseUid: authEventData.firebaseUid,
        deviceId: authEventData.deviceId,
        type: authEventData.type,
        error: error.message,
        code: error.code
      }, 'AuthEventService');

      throw error;
    }
  }

  // Utility Methods

  /**
   * Transforms MongoDB document to clean AuthEventInterface object
   * @param doc - MongoDB auth event document
   * @returns AuthEventInterface - Clean auth event object without MongoDB metadata
   */
  private transformToAuthEvent(doc: AuthEventDocument): AuthEventInterface {
    return {
      _id: doc._id.toString(),
      firebaseUid: doc.firebaseUid,
      deviceId: doc.deviceId,
      ip: doc.ip,
      clientTimestamp: doc.clientTimestamp.toISOString(),
      type: doc.type,
      timestamp: doc.timestamp,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}