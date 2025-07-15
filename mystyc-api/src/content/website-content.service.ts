import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';

import { ScheduleExecutionsService } from '@/schedules/schedule-executions.service';
import { Content, ContentDocument } from './schemas/content.schema';
import { Content as ContentInterface } from '@/common/interfaces/content.interface';
import { OpenAIWebsiteService } from '@/openai/openai-website.service';
import { BaseAdminQueryDto } from '@/admin/dto/base-admin-query.dto';
import { logger } from '@/common/util/logger';

class ContentGenerationTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Content generation timed out after ${timeoutMs}ms`);
    this.name = 'ContentGenerationTimeoutError';
  }
}

@Injectable()
export class WebsiteContentService {
  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
    private readonly openAIService: OpenAIWebsiteService,
    private readonly scheduleExecutionService: ScheduleExecutionsService
  ) {}
 
  /**
   * Handles scheduled website content generation events from Schedule Service
   * @param payload - Event payload containing schedule context and scheduleId
   */
  @OnEvent('content.generate.website')
  async handleScheduledWebsiteContentGeneration(payload: any): Promise<void> {
    logger.info('Handling scheduled website content generation', {
      scheduleId: payload.scheduleId,
      executionId: payload.executionId,
      eventName: payload.eventName,
      timezone: payload.timezone || 'global',
      scheduledTime: payload.scheduledTime,
      executedAt: payload.executedAt,
    }, 'WebsiteContentService');

    const startTime = Date.now();

    try {
      // Determine the date for content generation
      const targetDate = payload.timezone 
        ? new Date(payload.localTime).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      logger.debug('Getting or generating website content for scheduled event for targetDate', {
        scheduleId: payload.scheduleId,
        targetDate,
        timezone: payload.timezone || 'global'
      }, 'WebsiteContentService');

      // Generate website content for the target date with scheduleId
      let content = await this.getOrGenerateWebsiteContent(targetDate, payload.scheduleId, payload.executionId);

      logger.info('Scheduled website content generation completed', {
        scheduleId: payload.scheduleId,
        executionId: payload.executionId,
        targetDate,
        contentId: content._id,
        status: content.status,
        timezone: payload.timezone || 'global',
      }, 'WebsiteContentService');

      // Tell schedule execution it succeeded
      const duration = Date.now() - startTime;
      await this.scheduleExecutionService.updateStatus(payload.executionId, 'completed', undefined, duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Check if this is a timeout error
      if (error instanceof ContentGenerationTimeoutError || error.name === 'ContentGenerationTimeoutError') {
        logger.warn('Scheduled website content generation timed out', {
          scheduleId: payload.scheduleId,
          executionId: payload.executionId,
          timezone: payload.timezone || 'global',
          error: error.message,
          duration,
          scheduledTime: payload.scheduledTime,
        }, 'WebsiteContentService');

        // Mark as timeout specifically
        await this.scheduleExecutionService.updateStatus(payload.executionId, 'timeout', error.message, duration);
      } else {
        logger.error('Scheduled website content generation failed', {
          scheduleId: payload.scheduleId,
          executionId: payload.executionId,
          timezone: payload.timezone || 'global',
          error: error.message,
          duration,
          scheduledTime: payload.scheduledTime,
        }, 'WebsiteContentService');

        // Mark as general failure
        await this.scheduleExecutionService.updateStatus(payload.executionId, 'failed', error.message, duration);
      }
      
      // Don't throw - we don't want to crash the scheduler
    }
  }

  /**
   * Get or generate website content for a specific date
   */
  async getOrGenerateWebsiteContent(date: string, scheduleId?: string, executionId?: string): Promise<ContentInterface> {
    logger.info('Getting or generating website content', { date, scheduleId, executionId }, 'WebsiteContentService');

    // Check if website content exists for this date
    const existing = await this.findWebsiteContentByDate(date);
    if (existing) {
      logger.info('Website content found in database', { date }, 'WebsiteContentService');
      return existing;
    }

    // Generate new website content
    return await this.generateWebsiteContent(date, scheduleId, executionId);
  }

  /**
   * Find website content by date
   */
  async findWebsiteContentByDate(date: string): Promise<ContentInterface | null> {
    logger.debug('Finding website content by date', { date }, 'WebsiteContentService');

    const content = await this.contentModel.findOne({ 
      date, 
      type: 'website_content' 
    }).exec();

    if (!content) {
      logger.debug('Website content not found', { date }, 'WebsiteContentService');
      return null;
    }
    
    logger.debug('Found website content for date, returning', { date }, 'WebsiteContentService');
    return this.transformToWebsiteContent(content);
  }

  /**
   * Generate website content for a specific date using OpenAI with timeout protection
   */
  async generateWebsiteContent(date: string, scheduleId?: string, executionId?: string): Promise<ContentInterface> {
    logger.info('Generating new website content with OpenAI', { date, scheduleId, executionId }, 'WebsiteContentService');

    // Create content record first to get ID
    const content = new this.contentModel({
      type: 'website_content',
      date,
      scheduleId,
      executionId,
      title: 'Generating...', // Temporary
      message: 'Generating...', // Temporary
      data: [],
      sources: [],
      status: 'pending',
      generatedAt: new Date(),
      generationDuration: 0
    });
    const savedContent = await content.save();

    // Fire off OpenAI generation asynchronously (no await)
    const updatedContent = await this.openAIService.generateWebsiteContent(date, savedContent);

    return this.transformToWebsiteContent(updatedContent);
  }

  /**
   * Get today's website content (convenience method)
   */
  async getTodaysWebsiteContent(): Promise<ContentInterface> {
    const today = new Date().toISOString().split('T')[0];
    return await this.getOrGenerateWebsiteContent(today);
  }

  // Admin methods for pagination/stats
  async getTotal(): Promise<number> {
    return await this.contentModel.countDocuments({ type: 'website_content' });
  }

  async findAll(query: BaseAdminQueryDto): Promise<ContentInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { type: 'website_content' } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const content = await this.contentModel.aggregate(pipeline).exec();
    return content.map(content => this.transformToWebsiteContent(content));
  }

  async getTotalByScheduleId(scheduleId: string): Promise<number> {
    return await this.contentModel.countDocuments({ scheduleId });
  }

  async findByScheduleId(scheduleId: string, query: BaseAdminQueryDto): Promise<ContentInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { scheduleId } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const content = await this.contentModel.aggregate(pipeline).exec();
    return content.map(content => this.transformToWebsiteContent(content));
  }

  async getTotalByExecutionId(executionId: string): Promise<number> {
    return await this.contentModel.countDocuments({ executionId });
  }

  async findByExecutionId(executionId: string, query: BaseAdminQueryDto): Promise<ContentInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { executionId } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const content = await this.contentModel.aggregate(pipeline).exec();
    return content.map(content => this.transformToWebsiteContent(content));
  }

  /**
   * Transform document to interface
   */
  private transformToWebsiteContent(doc: ContentDocument): ContentInterface {
    return {
      _id: doc._id.toString(),
      type: doc.type,
      date: doc.date,
      
      // Website content links
      scheduleId: doc.scheduleId,
      executionId: doc.executionId,

      // AI request link
      openAIData: doc.openAIData,
      
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