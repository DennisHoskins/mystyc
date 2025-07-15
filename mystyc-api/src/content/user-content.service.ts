import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Content, ContentDocument } from './schemas/content.schema';
import { Content as ContentInterface } from '@/common/interfaces/content.interface';
import { OpenAIUserService } from '@/openai/openai-user.service';
import { BaseAdminQueryDto } from '@/admin/dto/base-admin-query.dto';
import { logger } from '@/common/util/logger';

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
    logger.info('Generating new user content with OpenAI', { date, userId }, 'UserContentService');

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

    // Fire off OpenAI generation asynchronously (no await)
    this.openAIService.generateUserContent(userId, date, savedContent._id.toString());

    return this.transformToUserContent(savedContent);
  }

  /**
   * Get today's website content (convenience method)
   */
  async getTodaysUserContent(userId: string): Promise<ContentInterface> {
    const today = new Date().toISOString().split('T')[0];
    return this.getOrGenerateUserContent(userId, today);
  }

  // Admin methods for pagination/stats
  async getTotal(): Promise<number> {
    return await this.contentModel.countDocuments({ type: 'user_content' });
  }

  async findAll(query: BaseAdminQueryDto): Promise<ContentInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { type: 'user_content' } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const content = await this.contentModel.aggregate(pipeline).exec();
    return content.map(content => this.transformToUserContent(content));
  }

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

  /**
   * Transform document to interface
   */
  private transformToUserContent(doc: ContentDocument): ContentInterface {
    return {
      _id: doc._id.toString(),
      type: doc.type,

      date: doc.date,
      
      // User content link
      userId: doc.userId,

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