import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AuthEvent as AuthEventInterface, validateAuthEventInputSafe } from 'mystyc-common/schemas/';
import { BaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { AuthEvent, AuthEventDocument } from './schemas/auth-event.schema';

@Injectable()
export class AuthEventsService {
  constructor(
    @InjectModel(AuthEvent.name) private authEventModel: Model<AuthEventDocument>,
  ) {}

  /**
   * Retrieves a single auth event by ID
   */
  async findById(eventId: string): Promise<AuthEventInterface | null> {
    logger.debug('Finding auth event by ID', { eventId }, 'AuthEventService');
    try {
      const event = await this.authEventModel.findById(eventId).exec();
      if (!event) return null;
      return this.transformToAuthEvent(event as AuthEventDocument);
    } catch {
      return null;
    }
  }

  /**
   * @returns number - Retrieves auth events records total
   */
  async getTotal(): Promise<number> {
    return await this.authEventModel.countDocuments();
  }  

  /**
   * Retrieves auth events (admin) with pagination and sorting
   */
  async findAll(query: BaseAdminQuery): Promise<AuthEventInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'timestamp', sortOrder = 'desc' } = query;
    const sortObj: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const events = await this.authEventModel
      .find()
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .exec();

    return events.map(evt => this.transformToAuthEvent(evt as AuthEventDocument));
  }

  /**
   * @param firebaseUid - Firebase user unique identifier
   * @returns number - Retrieves auth events records total
   */
  async getTotalByFirebaseUid(firebaseUid: string): Promise<number> {
    return await this.authEventModel.countDocuments({ firebaseUid });
  }

  /**
   * Retrieves user's auth event records with pagination and sorting (admin use)
   * @param firebaseUid - Firebase user unique identifier
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<DeviceInterface[]> - Array of auth event records with applied query params
   */
  async findByFirebaseUid(firebaseUid: string, query: BaseAdminQuery): Promise<AuthEventInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    logger.debug('Finding user auth events with query', { 
      firebaseUid,
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'AuthEventService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { firebaseUid } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const authEvents = await this.authEventModel
      .aggregate(pipeline)
      .exec();

    logger.debug('User auth events found', { 
      firebaseUid,
      count: authEvents.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'AuthEventService');

    return authEvents.map(device => this.transformToAuthEvent(device));
  }

  /**
   * @param deviceId - Device id unique identifier
   * @returns number - Retrieves auth events records total
   */
  async getTotalByDeviceId(deviceId: string): Promise<number> {
    return await this.authEventModel.countDocuments({ deviceId });
  }

  /**
   * Retrieves device's auth event records with pagination and sorting (admin use)
   * @param deviceId - Device id unique identifier
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<AuthEventInterface[]> - Array of auth event records with applied query params
   */
  async findByDeviceId(deviceId: string, query: BaseAdminQuery): Promise<AuthEventInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    logger.debug('Finding device auth events with query', { 
      deviceId,
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'AuthEventService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { deviceId } },
      { $sort: sortObj },
      // Remove $group - we want all auth events for this device
      { $skip: offset },
      { $limit: limit },
    ];

    const authEvents = await this.authEventModel
      .aggregate(pipeline)
      .exec();

    logger.debug('Device auth events found', { 
      deviceId,
      count: authEvents.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'AuthEventService');

    return authEvents.map(event => this.transformToAuthEvent(event));
  }

  /**
   * Records a new auth event
   */
  async recordAuthEvent(data: AuthEventInterface): Promise<AuthEventInterface> {

    const validation = validateAuthEventInputSafe(data);
    if (!validation.success) {
      throw validation.error;
    }

    const event = new this.authEventModel({
      firebaseUid: data.firebaseUid,
      email: data.email,
      deviceId: data.deviceId,
      deviceName: data.deviceName,
      type: data.type,
      ip: data.ip,
      timestamp: new Date(),
      clientTimestamp: new Date(data.clientTimestamp),
    });
    const saved = await event.save();
    return this.transformToAuthEvent(saved as AuthEventDocument);
  }

  /**
   * Transforms a document to AuthEventInterface
   */
  private transformToAuthEvent(
    doc: AuthEventDocument
  ): AuthEventInterface {
    return {
      _id: doc._id.toString(),
      firebaseUid: doc.firebaseUid,
      email: doc.email,
      deviceId: doc.deviceId,
      deviceName: doc.deviceName,
      ip: doc.ip,
      clientTimestamp: doc.clientTimestamp instanceof Date 
        ? doc.clientTimestamp.toISOString() 
        : doc.clientTimestamp || 'unknown',
      type: doc.type,
      timestamp: doc.timestamp,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
