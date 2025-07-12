import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';

import { ScheduleExecutionService } from '@/schedule/schedule-execution.service';
import { Content, ContentDocument } from './schemas/content.schema';
import { Content as ContentInterface } from '@/common/interfaces/content.interface';
import { OpenAIService } from '@/openai/openai.service';
import { BaseAdminQueryDto } from '@/admin/dto/base-admin-query.dto';
import { logger } from '@/common/util/logger';

@Injectable()
export class WebsiteContentService {
  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
    private readonly openAIService: OpenAIService,
    private readonly scheduleExecutionService: ScheduleExecutionService
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
        ? new Date(payload.localTime).toISOString().split('T')[0]  // Use local date for timezone-aware
        : new Date().toISOString().split('T')[0];                   // Use server date for global

      logger.debug('Getting or generating website content for scheduled event for targetDate', {
        scheduleId: payload.scheduleId,
        targetDate,
        timezone: payload.timezone || 'global'
      }, 'WebsiteContentService');


      // Generate website content for the target date with scheduleId
      const content = await this.getOrGenerateWebsiteContent(targetDate, payload.scheduleId, payload.executionId);

      logger.info('Scheduled website content generation completed', {
        scheduleId: payload.scheduleId,
        executionId: payload.executionId,
        targetDate,
        contentId: content._id,
        status: content.status,
        timezone: payload.timezone || 'global',
      }, 'WebsiteContentService');

      // tell schedule execution it succeeded
      const duration = Date.now() - startTime;
      await this.scheduleExecutionService.updateStatus(payload.executionId, 'completed', undefined, duration);
    } catch (error) {
      logger.error('Scheduled website content generation failed', {
        scheduleId: payload.scheduleId,
        executionId: payload.executionId,
        taskId: payload.taskId,
        timezone: payload.timezone || 'global',
        error: error.message,
        scheduledTime: payload.scheduledTime,
      }, 'WebsiteContentService');

      // tell schedule execution it failed
      const duration = Date.now() - startTime;
      await this.scheduleExecutionService.updateStatus(payload.executionId, 'failed', error.message, duration);      
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
    return this.generateWebsiteContent(date, scheduleId, executionId);
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
    logger.info('Generating website content with timeout protection', { date, scheduleId, executionId }, 'WebsiteContentService');

    try {
      return await Promise.race([
        this.doGenerateWebsiteContent(date, scheduleId, executionId),
        this.createTimeoutPromise(60000) // 60 second timeout
      ]);
    } catch (error) {
      logger.error('Website content generation failed or timed out', {
        date,
        scheduleId, 
        executionId,
        error: error.message
      }, 'WebsiteContentService');
      
      // Re-throw to let existing error handling in event handler catch it
      throw error;
    }
  }  

  /**
   * Creates a timeout promise that rejects after specified milliseconds
   */
  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Content generation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  /**
   * Generate website content for a specific date using OpenAI
   */
  private async doGenerateWebsiteContent(date: string, scheduleId?: string, executionId?: string): Promise<ContentInterface> {
    logger.info('Generating new website content with OpenAI', { date, scheduleId, executionId }, 'WebsiteContentService');

    const startTime = Date.now();

    try {
      // Try to generate content with OpenAI
      const aiResult = await this.openAIService.generateWebsiteContent(date);

      if (aiResult.success) {
        // OpenAI generation successful
        const contentData = {
          type: 'website_content',
          date,
          scheduleId,
          executionId,
          title: aiResult.title,
          message: aiResult.message,
          imageUrl: this.getDefaultImageUrl(date),
          linkUrl: 'https://mystyc.app',
          linkText: 'Explore Your Mystical Journey',
          data: this.formatContentData(aiResult.title, aiResult.message),
          sources: ['openai'],
          status: 'generated' as const,
          generatedAt: new Date(),
          generationDuration: Date.now() - startTime
        };

        const content = new this.contentModel(contentData);
        const saved = await content.save();

        logger.info('Website content generated successfully with OpenAI', { 
          date, 
          scheduleId,
          executionId,
          contentId: saved._id.toString(),
          duration: saved.generationDuration,
          cost: aiResult.cost,
          tokensUsed: aiResult.tokensUsed
        }, 'WebsiteContentService');

        return this.transformToWebsiteContent(saved);
      } else {
        // OpenAI failed or budget exceeded - try fallback
        logger.warn('OpenAI generation failed, attempting fallback', { date }, 'WebsiteContentService');
        return this.generateFallbackContent(date, scheduleId, executionId, startTime);
      }

    } catch (error) {
      logger.error('Website content generation failed', {
        date,
        scheduleId,
        executionId,
        error: error.message
      }, 'WebsiteContentService');

      // Generate fallback content
      return this.generateFallbackContent(date, scheduleId, executionId, startTime, error.message);
    }
  }

  /**
   * Generate fallback content when OpenAI fails or budget is exceeded
   * First tries to return the most recent content, then creates generic content
   */
  private async generateFallbackContent(
    date: string, 
    scheduleId?: string, 
    executionId?: string, 
    startTime?: number,
    error?: string
  ): Promise<ContentInterface> {
    logger.info('Generating fallback content', { date }, 'WebsiteContentService');

    try {
      // Try to get the most recent generated content as fallback
      const recentContent = await this.contentModel
        .findOne({ 
          type: 'website_content',
          status: 'generated',
          date: { $lt: date } // Content from before this date
        })
        .sort({ date: -1 })
        .exec();

      if (recentContent) {
        // Create new content based on most recent, but mark as fallback
        const fallbackData = {
          type: 'website_content',
          date,
          scheduleId,
          executionId,
          title: recentContent.title,
          message: recentContent.message,
          imageUrl: this.getDefaultImageUrl(date),
          linkUrl: 'https://mystyc.app',
          linkText: 'Explore Your Mystical Journey',
          data: recentContent.data,
          sources: ['fallback'],
          status: 'fallback' as const,
          error: error || 'OpenAI generation failed, using fallback content',
          generatedAt: new Date(),
          generationDuration: startTime ? Date.now() - startTime : 0
        };

        const content = new this.contentModel(fallbackData);
        const saved = await content.save();

        logger.info('Fallback content created from recent content', {
          date,
          fallbackSourceDate: recentContent.date,
          contentId: saved._id.toString()
        }, 'WebsiteContentService');

        return this.transformToWebsiteContent(saved);
      }

      // No recent content available - create generic fallback
      const genericFallbackData = {
        type: 'website_content',
        date,
        scheduleId,
        executionId,
        title: 'Mystical Insights Await',
        message: 'The universe whispers secrets to those who listen. Today brings opportunities for growth and discovery.',
        imageUrl: this.getDefaultImageUrl(date),
        linkUrl: 'https://mystyc.app',
        linkText: 'Explore Your Mystical Journey',
        data: [
          { key: 'Cosmic Message', value: 'The stars align in your favor today.' },
          { key: 'Daily Wisdom', value: 'Trust in the journey, even when the path is unclear.' },
          { key: 'Mystical Insight', value: 'Your intuition is your greatest guide.' }
        ],
        sources: ['fallback'],
        status: 'fallback' as const,
        error: error || 'OpenAI generation failed, using generic fallback content',
        generatedAt: new Date(),
        generationDuration: startTime ? Date.now() - startTime : 0
      };

      const content = new this.contentModel(genericFallbackData);
      const saved = await content.save();

      logger.info('Generic fallback content created', {
        date,
        contentId: saved._id.toString()
      }, 'WebsiteContentService');

      return this.transformToWebsiteContent(saved);

    } catch (fallbackError) {
      logger.error('Fallback content generation also failed', {
        date,
        originalError: error,
        fallbackError: fallbackError.message
      }, 'WebsiteContentService');

      // This should never happen, but just in case...
      throw new Error('Both OpenAI and fallback content generation failed');
    }
  }

  /**
   * Get today's website content (convenience method)
   */
  async getTodaysWebsiteContent(): Promise<ContentInterface> {
    const today = new Date().toISOString().split('T')[0];
    return this.getOrGenerateWebsiteContent(today);
  }

  // Admin methods for pagination/stats (unchanged from original)
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

  // Helper methods
  private getDefaultImageUrl(date: string): string {
    // Use date hash to pick from a few default mystical images
    const images = [
      'https://images.unsplash.com/photo-1516912481808-3406841bd33c',
      'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    ];
    const dateHash = date.split('-').reduce((acc, part) => acc + parseInt(part), 0);
    return images[dateHash % images.length];
  }

  private formatContentData(title: string, message: string): Array<{key: string, value: string}> {
    return [
      { key: 'Daily Insight', value: title },
      { key: 'Cosmic Message', value: message },
      { key: 'Generated By', value: 'AI Mystical Oracle' }
    ];
  }

  /**
   * Transform document to interface
   */
  private transformToWebsiteContent(doc: ContentDocument): ContentInterface {
    return {
      _id: doc._id.toString(),
      date: doc.date,
      
      // Website content links
      scheduleId: doc.scheduleId,
      executionId: doc.executionId,
      
      // Notification content links
      notificationId: doc.notificationId,
      
      // User content links
      firebaseUid: doc.firebaseUid,
      
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