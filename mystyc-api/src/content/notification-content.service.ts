import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Content as ContentInterface } from 'mystyc-common/schemas';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { Content, ContentDocument } from './schemas/content.schema';

export class NotificationContentTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Notification content generation timed out after ${timeoutMs}ms`);
    this.name = 'NotificationContentTimeoutError';
  }
}

@Injectable()
export class NotificationContentService {
  private readonly notificationContentTemplates = [
    {
      title: "Notification 1 Title",
      message: "This is the Notification 1 Message",
      linkUrl: "https://mystyc.app",
      linkText: "Notification 1 Link",
      data: [
        { "NotificationData": "This is some data 1" },
      ],
    },
    {
      title: "Notification 2 Title",
      message: "This is the Notification 2 Message",
      linkUrl: "https://mystyc.app",
      linkText: "Notification 2 Link",
      data: [
        { "NotificationData": "This is some data 2" },
      ],
    },
  ];
  
  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
  ) {}

  /**
   * Generates notification content for a specific notification with timeout protection
   */
  async generateNotificationContent(scheduleId: string, executionId: string, date?: string): Promise<ContentInterface> {
    logger.info('Generating notification content with timeout protection', { 
      scheduleId, 
      executionId, 
      date 
    }, 'NotificationContentService');

    try {
      return await Promise.race([
        this.doGenerateNotificationContent(scheduleId, executionId, date),
        this.createTimeoutPromise(30000) // 30 second timeout (shorter than website content)
      ]);
    } catch (error) {
      logger.error('Notification content generation failed or timed out', {
        scheduleId,
        executionId,
        date,
        error
      }, 'NotificationContentService');
      
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
        reject(new NotificationContentTimeoutError(timeoutMs));
      }, timeoutMs);
    });
  }

  /**
   * Generates notification content for a specific notification
   * This is the main entry point - each notification gets its own content
   * @param scheduleId - The schedule ID that needs content
   * @param executionId - The schedule execution ID that needs content
   * @param date - Date for the content (defaults to today)
   * @returns Promise<ContentInterface> - Generated content linked to the notification
   */
  private async doGenerateNotificationContent(scheduleId: string, executionId: string, date?: string): Promise<ContentInterface> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    logger.info('Generating notification content for notification', { 
      scheduleId, 
      executionId, 
      date: targetDate 
    }, 'NotificationContentService');

    const startTime = Date.now();

    try {
      // Use date as seed for consistent content selection
      const dateHash = targetDate.split('-').reduce((acc, part) => acc + parseInt(part), 0);
      const template = this.notificationContentTemplates[dateHash % this.notificationContentTemplates.length];

      const dataItems = template.data.map(obj => {
        const record = obj as Record<string,string>;
        const key = Object.keys(record)[0];
        return { key, value: record[key] };
      });

      const contentData = {
        type: 'notification_content',
        date: targetDate,
        scheduleId, 
        executionId, 
        ...template,
        data: dataItems,
        sources: ['notification_templates'],
        status: 'generated' as const,
        generatedAt: new Date(),
        generationDuration: Date.now() - startTime
      };

      const content = new this.contentModel(contentData);
      const saved = await content.save();

      logger.info('Notification content generated successfully', { 
        scheduleId, 
        executionId, 
        contentId: saved._id.toString(),
        date: targetDate,
        duration: saved.generationDuration 
      }, 'NotificationContentService');

      return this.transformToNotificationContent(saved);
    } catch (error) {
      logger.error('Notification content generation failed', {
        scheduleId, 
        executionId, 
        date: targetDate,
        error
      }, 'NotificationContentService');

      // Save failed attempt
      const failedContent = new this.contentModel({
        type: 'notification_content',
        date: targetDate,
        scheduleId, 
        executionId, 
        title: 'Mystyc Notification',
        message: 'Your daily mystical insights await.',
        data: [],
        sources: ['notification_templates'],
        status: 'failed',
        error,
        generatedAt: new Date(),
        generationDuration: Date.now() - startTime
      });

      const saved = await failedContent.save();
      return this.transformToNotificationContent(saved);
    }
  }

  // Admin methods for pagination/stats
  async getTotal(): Promise<number> {
    return await this.contentModel.countDocuments({ type: 'notification_content' });
  }

  async findAll(queryRaw: BaseAdminQuery): Promise<ContentInterface[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { type: 'notification_content' } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const content = await this.contentModel.aggregate(pipeline).exec();
    return content.map(content => this.transformToNotificationContent(content));
  }

  async getTotalByScheduleId(scheduleId: string): Promise<number> {
    return await this.contentModel.countDocuments({ scheduleId });
  }

  /**
   * Finds notification content by notification ID
   * @param notificationId - Notification ID to find content for
   * @returns Promise<ContentInterface | null> - Content if found, null otherwise
   */
  async findByNotificationId(notificationId: string): Promise<ContentInterface | null> {
    logger.debug('Finding notification content by notification ID', { notificationId }, 'NotificationContentService');

    const content = await this.contentModel.findOne({ 
      notificationId,
      type: 'notification_content' 
    }).exec();

    if (!content) {
      logger.debug('Notification content not found', { notificationId }, 'NotificationContentService');
      return null;
    }

    return this.transformToNotificationContent(content);
  }

  /**
   * Generates content without notification linking (for legacy compatibility)
   * @param date - Date for content generation
   * @returns Promise<ContentInterface> - Generated content
   */
  private async generateUnlinkedContent(date: string): Promise<ContentInterface> {
    const startTime = Date.now();

    try {
      // Check if unlinked content already exists for this date
      const existing = await this.contentModel.findOne({ 
        date, 
        type: 'notification_content',
        notificationId: { $exists: false }
      }).exec();

      if (existing) {
        return this.transformToNotificationContent(existing);
      }

      // Generate new unlinked content
      const dateHash = date.split('-').reduce((acc, part) => acc + parseInt(part), 0);
      const template = this.notificationContentTemplates[dateHash % this.notificationContentTemplates.length];

      const dataItems = template.data.map(obj => {
        const record = obj as Record<string,string>;
        const key = Object.keys(record)[0];
        return { key, value: record[key] };
      });

      const contentData = {
        type: 'notification_content',
        date,
        // NO notificationId for legacy content
        ...template,
        data: dataItems,
        sources: ['notification_templates'],
        status: 'generated' as const,
        generatedAt: new Date(),
        generationDuration: Date.now() - startTime
      };

      const content = new this.contentModel(contentData);
      const saved = await content.save();

      logger.info('Legacy notification content generated', { 
        contentId: saved._id.toString(),
        date,
        duration: saved.generationDuration 
      }, 'NotificationContentService');

      return this.transformToNotificationContent(saved);
    } catch (error) {
      logger.error('Legacy notification content generation failed', {
        date,
        error
      }, 'NotificationContentService');
      throw error;
    }
  }

  /**
   * Gets notification data optimized for push notifications
   * @param notificationId - Notification ID that needs content
   * @param date - Optional date for content (defaults to today)
   * @returns Promise<{title: string; body: string; fullContent: ContentInterface}> - Optimized notification data
   */
  async getNotificationData(scheduleId: string, executionId: string, date?: string): Promise<{ 
    title: string; 
    body: string; 
    fullContent: ContentInterface 
  }> {
    const content = await this.generateNotificationContent(scheduleId, executionId, date);

    // Optimize for mobile push notifications
    const title = this.truncateForNotification(content.title, 40);
    const body = this.truncateForNotification(content.message, 100);

    return {
      title,
      body,
      fullContent: content
    };
  }

  /**
   * Truncates text for notification display with smart word boundaries
   */
  private truncateForNotification(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    
    // Try to truncate at word boundary
    const truncated = text.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.7) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }

  /**
   * Transform document to interface
   */
  private transformToNotificationContent(doc: ContentDocument): ContentInterface {
    return {
      _id: doc._id.toString(),
      type: doc.type,
      date: doc.date,

      scheduleId: doc.scheduleId,
      executionId: doc.executionId,
      notificationId: doc.notificationId,

      openAIData: doc.openAIData,

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