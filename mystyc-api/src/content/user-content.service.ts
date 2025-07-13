import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Content, ContentDocument } from './schemas/content.schema';
import { Content as ContentInterface } from '@/common/interfaces/content.interface';
import { OpenAIUserService } from '@/openai/openai-user.service';
import { BaseAdminQueryDto } from '@/admin/dto/base-admin-query.dto';
import { logger } from '@/common/util/logger';
import { OpenAIRequest } from '@/openai/schemas/openai-request.schema';

class ContentGenerationTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Content generation timed out after ${timeoutMs}ms`);
    this.name = 'ContentGenerationTimeoutError';
  }
}

@Injectable()
export class UserContentService {
  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
    private readonly openAIService: OpenAIUserService,
  ) {}

  /**
   * Get or generate user content for a specific date
   */
  async getOrGenerateUserContent(userId: string, date: string): Promise<ContentInterface> {
    logger.info('Getting or generating user content', { date, userId }, 'UserContentService');

    // Check if user content exists for this date
    const existing = await this.findUserContentByDate(date);
    if (existing) {
      logger.info('User content found in database', { date }, 'UserContentService');
      return existing;
    }

    // Generate new user content
    return this.generateUserContent(date, userId);
  }

  /**
   * Find user content by date
   */
  async findUserContentByDate(date: string): Promise<ContentInterface | null> {
    logger.debug('Finding user content by date', { date }, 'UserContentService');

    const content = await this.contentModel.findOne({ 
      date, 
      type: 'user_content' 
    }).exec();

    if (!content) {
      logger.debug('User content not found', { date }, 'UserContentService');
      return null;
    }
    
    logger.debug('Found user content for date, returning', { date }, 'UserContentService');
    return this.transformToUserContent(content);
  }

  /**
   * Generate user content for a specific date using OpenAI with timeout protection
   */
  async generateUserContent(date: string, userId?: string): Promise<ContentInterface> {
    logger.info('Generating user content with timeout protection', { date, userId }, 'UserContentService');

    try {
      return await Promise.race([
        this.doGenerateUserContent(date, userId),
        this.createTimeoutPromise(60000) // 60 second timeout
      ]);
    } catch (error) {
      logger.error('User content generation failed or timed out', {
        date,
        userId, 
        error: error.message
      }, 'UserContentService');
      
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
        reject(new ContentGenerationTimeoutError(timeoutMs));
      }, timeoutMs);
    });
  }

  /**
   * Generate user content for a specific date using OpenAI
   */
  private async doGenerateUserContent(date: string, userId?: string): Promise<ContentInterface> {
    logger.info('Generating new user content with OpenAI', { date, userId }, 'UserContentService');

    const startTime = Date.now();

    try {
      // Create content record first to get ID
      const content = new this.contentModel({
        type: 'user_content',
        date,
        userId,
        title: 'Generating...', // Temporary
        message: 'Generating...', // Temporary
        data: [],
        sources: [],
        status: 'pending',
        generatedAt: new Date(),
        generationDuration: 0
      });
      const savedContent = await content.save();

      // Now call OpenAI with content ID
      const aiResult = await this.openAIService.generateUserContent(userId, date, {
        requestType: 'user_content',
        linkedEntityId: savedContent._id.toString()
      });

      if (aiResult.success) {
        // Update content with actual data and OpenAI request ID
        await this.contentModel.findByIdAndUpdate(savedContent._id, {
          title: aiResult.title,
          message: aiResult.message,
          openAIRequestId: aiResult.openAIRequestId,
          imageUrl: this.getDefaultImageUrl(date),
          linkUrl: 'https://mystyc.app',
          linkText: 'Explore Your Mystical Journey',
          data: this.formatContentData(aiResult.title, aiResult.message),
          sources: ['openai'],
          status: 'generated',
          generationDuration: Date.now() - startTime
        });

        const finalContent = await this.contentModel.findById(savedContent._id);
        const saved = finalContent;

        logger.info('User content generated successfully with OpenAI', { 
          date, 
          userId,
          contentId: saved._id.toString(),
          OpenAIRequestId: saved.openAIRequestId,
          duration: saved.generationDuration,
          cost: aiResult.cost,
          tokensUsed: aiResult.tokensUsed
        }, 'UserContentService');

        return this.transformToUserContent(saved);
      } else {
        // OpenAI failed or budget exceeded - try fallback
        logger.warn('OpenAI generation failed, attempting fallback', { date }, 'UserContentService');
        return this.generateFallbackContent(date, userId, startTime);
      }

    } catch (error) {
      logger.error('User content generation failed', {
        date,
        userId,
        error: error.message
      }, 'UserContentService');

      // Generate fallback content
      return this.generateFallbackContent(date, userId, startTime, error.message);
    }
  }

  /**
   * Generate fallback content when OpenAI fails or budget is exceeded
   * First tries to return the most recent content, then creates generic content
   */
  private async generateFallbackContent(
    date: string, 
    userId?: string, 
    startTime?: number,
    error?: string
  ): Promise<ContentInterface> {
    logger.info('Generating fallback content', { date }, 'UserContentService');

    try {
      // Try to get the most recent generated content as fallback
      const recentContent = await this.contentModel
        .findOne({ 
          type: 'user_content',
          status: 'generated',
          date: { $lt: date } // Content from before this date
        })
        .sort({ date: -1 })
        .exec();

      if (recentContent) {
        // Create new content based on most recent, but mark as fallback
        const fallbackData = {
          type: 'user_content',
          date,
          userId,
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
        }, 'UserContentService');

        return this.transformToUserContent(saved);
      }

      // No recent content available - create generic fallback
      const genericFallbackData = {
        type: 'user_content',
        date,
        userId,
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
      }, 'UserContentService');

      return this.transformToUserContent(saved);

    } catch (fallbackError) {
      logger.error('Fallback content generation also failed', {
        date,
        originalError: error,
        fallbackError: fallbackError.message
      }, 'UserContentService');

      // This should never happen, but just in case...
      throw new Error('Both OpenAI and fallback content generation failed');
    }
  }

  /**
   * Get today's website content (convenience method)
   */
  async getTodaysUserContent(userId: string): Promise<ContentInterface> {
    const today = new Date().toISOString().split('T')[0];
    return this.getOrGenerateUserContent(userId, today);
  }

  // Admin methods for pagination/stats
  async getTotalByUserId(userId: string): Promise<number> {
    return await this.contentModel.countDocuments({ userId });
  }

  async findByUserId(userId: string, query: BaseAdminQueryDto): Promise<ContentInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { userId } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const content = await this.contentModel.aggregate(pipeline).exec();
    return content.map(content => this.transformToUserContent(content));
  }

  private formatContentData(title: string, message: string): Array<{key: string, value: string}> {
    return [
      { key: 'Daily Insight', value: title },
      { key: 'Cosmic Message', value: message },
      { key: 'Generated By', value: 'AI Mystical Oracle' }
    ];
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

  /**
   * Transform document to interface
   */
  private transformToUserContent(doc: ContentDocument): ContentInterface {
    return {
      _id: doc._id.toString(),
      date: doc.date,
      
      // User content link
      userId: doc.userId,

      // AI request link
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