import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';

import { Content, ContentDocument } from './schemas/content.schema';
import { Content as ContentInterface } from '@/common/interfaces/content.interface';
import { logger } from '@/common/util/logger';

@Injectable()
export class NotificationContentService {
  private readonly notificationContentTemplates = [
    {
      title: "Mystic Dawn Awaits",
      message: "New cosmic energies align. Trust your intuition today.",
      imageUrl: "https://images.unsplash.com/photo-1516912481808-3406841bd33c",
      linkUrl: "https://mystyc.app",
      linkText: "Open Mystyc",
      data: [
        { "Morning Energy": "Dawn brings fresh spiritual insights" },
        { "Intuitive Guidance": "Listen to your inner voice today" },
        { "Cosmic Alignment": "The universe supports your journey" }
      ],
    },
    {
      title: "Stars Whisper Secrets",
      message: "Celestial forces bring transformation. Stay open to change.",
      imageUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3",
      linkUrl: "https://mystyc.app",
      linkText: "Discover More",
      data: [
        { "Stellar Message": "Stars guide your path forward" },
        { "Transformation Time": "Embrace positive changes ahead" },
        { "Cosmic Wisdom": "Universal truth reveals itself" }
      ],
    },
    {
      title: "Ancient Wisdom Calls",
      message: "Timeless knowledge awakens. Your inner power grows stronger.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      linkUrl: "https://mystyc.app",
      linkText: "Explore Wisdom",
      data: [
        { "Sacred Knowledge": "Ancient truths illuminate your way" },
        { "Inner Strength": "Your spiritual power awakens" },
        { "Mystical Insight": "Hidden wisdom becomes clear" }
      ],
    },
  ];
  
  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
  ) {}

  /**
   * Get or generate notification content for a specific date
   */
  async getOrGenerateNotificationContent(date: string, scheduleId?: string, executionId?: string): Promise<ContentInterface> {
    logger.info('Getting or generating notification content', { date, scheduleId, executionId }, 'NotificationContentService');

    // Check if notification content exists for this date
    const existing = await this.findNotificationContentByDate(date);
    if (existing) {
      logger.info('Notification content found in database', { date }, 'NotificationContentService');
      return existing;
    }

    // Generate new notification content
    return this.generateNotificationContent(date, scheduleId, executionId);
  }

  /**
   * Find notification content by date
   */
  async findNotificationContentByDate(date: string): Promise<ContentInterface | null> {
    logger.debug('Finding notification content by date', { date }, 'NotificationContentService');

    const content = await this.contentModel.findOne({ 
      date, 
      type: 'notification_content' 
    }).exec();

    if (!content) {
      logger.debug('Notification content not found', { date }, 'NotificationContentService');
      return null;
    }

    return this.transformToNotificationContent(content);
  }

  /**
   * Generate notification content for a specific date
   */
  async generateNotificationContent(date: string, scheduleId?: string, executionId?: string): Promise<ContentInterface> {
    logger.info('Generating new notification content', { date, scheduleId, executionId }, 'NotificationContentService');

    const startTime = Date.now();

    try {
      // Use date as seed for consistent content
      const dateHash = date.split('-').reduce((acc, part) => acc + parseInt(part), 0);
      const template = this.notificationContentTemplates[dateHash % this.notificationContentTemplates.length];

      const dataItems = template.data.map(obj => {
        const key = Object.keys(obj)[0];
        return { key, value: obj[key] };
      });      

      const contentData = {
        type: 'notification_content',
        date,
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
        date, 
        scheduleId,
        executionId,
        contentId: saved._id.toString(),
        duration: saved.generationDuration 
      }, 'NotificationContentService');

      return this.transformToNotificationContent(saved);
    } catch (error) {
      logger.error('Notification content generation failed', {
        date,
        scheduleId,
        executionId,
        error: error.message
      }, 'NotificationContentService');

      // Save failed attempt
      const failedContent = new this.contentModel({
        type: 'notification_content',
        date,
        scheduleId,
        executionId,
        title: 'Mystyc Notification',
        message: 'Your daily mystical insights await.',
        imageUrl: 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229',
        data: [],
        sources: ['notification_templates'],
        status: 'failed',
        error: error.message,
        generatedAt: new Date(),
        generationDuration: Date.now() - startTime
      });

      const saved = await failedContent.save();
      return this.transformToNotificationContent(saved);
    }
  }

  /**
   * Get today's notification content (convenience method)
   */
  async getTodaysNotificationContent(): Promise<ContentInterface> {
    const today = new Date().toISOString().split('T')[0];
    return this.getOrGenerateNotificationContent(today);
  }

  /**
   * Get notification content optimized for push notifications
   * Returns shorter title and message suitable for mobile notifications
   */
  async getNotificationData(date?: string): Promise<{ title: string; body: string; fullContent: ContentInterface }> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const content = await this.getOrGenerateNotificationContent(targetDate);

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
      date: doc.date,
      scheduleId: doc.scheduleId,
      executionId: doc.executionId,
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