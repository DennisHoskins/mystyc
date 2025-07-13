import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Content, ContentDocument } from './schemas/content.schema';
import { Content as ContentInterface } from '@/common/interfaces/content.interface';
import { BaseAdminQueryDto } from '@/admin/dto/base-admin-query.dto';
import { logger } from '@/common/util/logger';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
  ) {}

  /**
   * Find content by ID (admin)
   */
  async findById(id: string): Promise<ContentInterface | null> {
    logger.debug('Finding content by ID', { id }, 'ContentService');

    try {
      const content = await this.contentModel.findById(id).exec();
      if (!content) return null;
      return this.transformToContent(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get total count (admin)
   */
  async getTotal(): Promise<number> {
    return await this.contentModel.countDocuments();
  }

  /**
   * Find all content with pagination (admin)
   */
  async findAll(query: BaseAdminQueryDto): Promise<ContentInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'date', sortOrder = 'desc' } = query;

    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const contents = await this.contentModel
      .find()
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .exec();

    return contents.map(content => this.transformToContent(content));
  }

  /**
   * Find content by notification ID (admin)
   */
  async findByNotificationId(notificationId: string, query: BaseAdminQueryDto): Promise<ContentInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    logger.debug('Finding notification content with query', {
      notificationId,
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'ContentService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { notificationId } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const content = await this.contentModel
      .aggregate(pipeline)
      .exec();

    logger.debug('Notification content found', {
      notificationId,
      count: content.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'ContentService');

    return content.map(content => this.transformToContent(content));
  }

  /**
   * Get total count by notification ID (admin)
   */
  async getTotalByNotificationId(notificationId: string): Promise<number> {
    return await this.contentModel.countDocuments({ notificationId });
  }

  /**
   * Find content by user (for future user-content)
   */
  async findByFirebaseUid(firebaseUid: string, query: BaseAdminQueryDto): Promise<ContentInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    logger.debug('Finding user content with query', {
      firebaseUid,
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'ContentService');

    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { firebaseUid } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const content = await this.contentModel
      .aggregate(pipeline)
      .exec();

    logger.debug('User content found', {
      firebaseUid,
      count: content.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'ContentService');

    return content.map(content => this.transformToContent(content));
  }

  /**
   * Get total count by user (for future user-content)
   */
  async getTotalByFirebaseUid(firebaseUid: string): Promise<number> {
    return await this.contentModel.countDocuments({ firebaseUid });
  }

 /**
   * Find content by date
   */
  async findByDate(date: string): Promise<ContentInterface | null> {
    logger.debug('Finding content by date', { date }, 'ContentService');

    const content = await this.contentModel.findOne({ date }).exec();

    if (!content) {
      logger.debug('Content not found', { date }, 'ContentService');
      return null;
    }

    return this.transformToContent(content);
  }

  async getTotalByScheduleId(scheduleId: string): Promise<number> {
    return await this.contentModel.countDocuments({ scheduleId });
  }

  async findByScheduleId(scheduleId: string, query: BaseAdminQueryDto): Promise<ContentInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    logger.debug('Finding schedule content with query', {
      scheduleId,
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'ContentService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { scheduleId } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const content = await this.contentModel
      .aggregate(pipeline)
      .exec();

    logger.debug('Schedule content found', {
      scheduleId,
      count: content.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'ContentService');

    return content.map(content => this.transformToContent(content));
  }

  async getTotalByExecutionId(executionId: string): Promise<number> {
    return await this.contentModel.countDocuments({ executionId });
  }

  async findByExecutionId(executionId: string, query: BaseAdminQueryDto): Promise<ContentInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    logger.debug('Finding schedule content with query', {
      executionId,
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'ContentService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { executionId } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const content = await this.contentModel
      .aggregate(pipeline)
      .exec();

    logger.debug('Schedule content found', {
      executionId,
      count: content.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'ContentService');

    return content.map(content => this.transformToContent(content));
  }

  /**
   * Transform aggregation result to interface (for pipeline queries)
   */
  transformToContent(doc: any): ContentInterface {
    return {
      _id: doc._id.toString(),
      date: doc.date,
      
      // Website content links
      scheduleId: doc.scheduleId,
      executionId: doc.executionId,

      // Notification content links
      notificationId: doc.notificationId,

      // User content link
      userId: doc.userId,

      // OpenAI links
      openAIRequestId: doc.openAIRequestId,

      // Core content
      title: doc.title,
      message: doc.message,
      data: doc.data,
      imageUrl: doc.imageUrl,
      linkUrl: doc.linkUrl,
      linkText: doc.linkText,
      sources: doc.sources,
      status: doc.status,
      error: doc.error,
      generatedAt: doc.generatedAt,
      generationDuration: doc.generationDuration,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }  
}