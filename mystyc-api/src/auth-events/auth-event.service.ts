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
   * Retrieves auth events for a user
   */
  async findByFirebaseUid(
    firebaseUid: string,
    limit = 50,
    offset = 0,
  ): Promise<AuthEventInterface[]> {
    const events = await this.authEventModel
      .find({ firebaseUid })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
    return events.map(evt => this.transformToAuthEvent(evt as AuthEventDocument));
  }

  /**
   * Retrieves auth events for a device
   */
  async findByDeviceId(
    deviceId: string,
    limit = 50,
    offset = 0,
  ): Promise<AuthEventInterface[]> {
    const events = await this.authEventModel
      .find({ deviceId })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
    return events.map(evt => this.transformToAuthEvent(evt as AuthEventDocument));
  }

  /**
   * Retrieves auth events (admin) with pagination and sorting
   */
  async findAll(query: BaseAdminQueryDto): Promise<AuthEventInterface[]> {
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
   * Records a new auth event
   */
  async recordAuthEvent(data: AuthEventInterface): Promise<AuthEventInterface> {
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
      clientTimestamp: doc.clientTimestamp.toISOString(),
      type: doc.type,
      timestamp: doc.timestamp,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
