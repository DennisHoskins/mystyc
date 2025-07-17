import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Content, ContentDocument } from './schemas/content.schema';
import { Content as ContentInterface } from '@/common/interfaces/content.interface';
import { UserProfile } from '@/common/interfaces/user-profile.interface';
import { SubscriptionLevel } from '@/common/enums/subscription-levels.enum';
import { UserProfilesService } from '@/users/user-profiles.service';
import { OpenAIUserPlusService } from '@/openai/openai-user-plus.service';
import { BaseAdminQueryDto } from '@/admin/dto/base-admin-query.dto';
import { logger } from '@/common/util/logger';

@Injectable()
export class UserPlusContentService {
  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
    private readonly userProfilesService: UserProfilesService,
    private readonly openAIService: OpenAIUserPlusService,
  ) {}

  /**
   * Get or generate plus content for a specific date
   */
  async getOrGeneratePlusContent(userProfile: UserProfile, date: string): Promise<ContentInterface> {
    logger.info('Getting or generating plus content', { date, userId: userProfile.firebaseUid }, 'UserPlusContentService');

    // Check if plus content exists for this date and user
    const existing = await this.findPlusContentByUserAndDate(userProfile.firebaseUid, date);
    if (existing) {
      logger.info('Plus content found in database', { date, userProflie: userProfile.firebaseUid }, 'UserPlusContentService');
      return existing;
    }

    // Validate subscription level for NEW content generation
    if (!this.canGenerateNewPlusContent(userProfile, date)) {
      throw new ForbiddenException("Insufficient subscription level for plus content generation");
    }

    // Generate new plus content
    return await this.generatePlusContent(date, userProfile);
  }

  /**
   * Find plus content by user and date
   */
  async findPlusContentByUserAndDate(userId: string, date: string): Promise<ContentInterface | null> {
    logger.debug('Finding plus content by user and date', { date, userId }, 'UserPlusContentService');

    const content = await this.contentModel.findOne({ 
      userId, 
      date, 
      type: 'plus_content' 
    }).exec();

    if (!content) {
      logger.debug('Plus content not found', { date, userId }, 'UserPlusContentService');
      return null;
    }
    
    logger.debug('Found plus content for date, returning', { date, userId }, 'UserPlusContentService');
    return this.transformToPlusContent(content);
  }

  /**
   * Generate plus content for a specific date using OpenAI
   */
  async generatePlusContent(date: string, userProfile: UserProfile): Promise<ContentInterface> {
    logger.info('Generating new plus content with OpenAI', { date, userId: userProfile.firebaseUid }, 'UserPlusContentService');

    // Create content record first to get ID
    const content = new this.contentModel({
      type: 'plus_content',
      date,
      userId: userProfile.firebaseUid,
      title: 'Generating...', // Temporary
      message: 'Generating...', // Temporary
      data: [],
      sources: [],
      status: 'pending',
      generatedAt: new Date(),
      generationDuration: 0
    });

    const savedContent = await content.save();

    // Wait for OpenAI to generate content
    const updatedContent = await this.openAIService.generatePlusContent(userProfile, date, savedContent);

    return this.transformToPlusContent(updatedContent);
  }

  /**
   * Get today's plus content (convenience method)
   */
  async getTodaysPlusContent(userId: string): Promise<ContentInterface> {
    const today = new Date().toISOString().split('T')[0];

    const userProfile = await this.userProfilesService.findByFirebaseUid(userId);
    if (!userProfile) {
      throw new NotFoundException("Unable to load User Profile");
    }

    return this.getOrGeneratePlusContent(userProfile, today);
  }

  /**
   * Check if user can generate NEW plus content for given date
   */
  private canGenerateNewPlusContent(userProfile: UserProfile, date: string): boolean {
    // Must have PLUS or PRO subscription
    if (userProfile.subscription.level === SubscriptionLevel.USER) {
      return false;
    }

    // Use the helper method from UserProfilesService
    return this.userProfilesService.canAccessTierContent(
      userProfile, 
      date, 
      SubscriptionLevel.PLUS
    );
  }

  /**
   * Check if user can ACCESS existing plus content (more permissive than generation)
   */
  async canAccessPlusContent(userId: string, date: string): Promise<boolean> {
    const userProfile = await this.userProfilesService.findByFirebaseUid(userId);
    if (!userProfile) {
      return false;
    }

    // If content exists, they can access it regardless of current subscription
    // (Historical access after downgrade)
    const existingContent = await this.findPlusContentByUserAndDate(userId, date);
    if (existingContent) {
      return true;
    }

    // For new content, check subscription level
    return this.canGenerateNewPlusContent(userProfile, date);
  }

  // Admin methods for pagination/stats
  async getTotal(): Promise<number> {
    return await this.contentModel.countDocuments({ type: 'plus_content' });
  }

  async findAll(query: BaseAdminQueryDto): Promise<ContentInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { type: 'plus_content' } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const content = await this.contentModel.aggregate(pipeline).exec();
    return content.map(content => this.transformToPlusContent(content));
  }

  async getTotalByUserId(userId: string): Promise<number> {
    return await this.contentModel.countDocuments({ 
      userId, 
      type: 'plus_content' 
    });
  }

  async findByUserId(userId: string, query: BaseAdminQueryDto): Promise<ContentInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { userId, type: 'plus_content' } },
      { $sort: sortObj },
      { $skip: offset },
      { $limit: limit },
    ];

    const content = await this.contentModel.aggregate(pipeline).exec();
    return content.map(content => this.transformToPlusContent(content));
  }

  /**
   * Transform document to interface
   */
  private transformToPlusContent(doc: ContentDocument): ContentInterface {
    return {
      _id: doc._id.toString(),
      type: doc.type,
      date: doc.date,
      
      // Plus content link
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