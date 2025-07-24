import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Content as ContentInterface, validateContentInputSafe, UserProfile } from 'mystyc-common/schemas';
import { SubscriptionLevel } from 'mystyc-common/constants/subscription-levels.enum';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { UserProfilesService } from '@/users/user-profiles.service';
import { OpenAIUserService } from '@/openai/openai-user.service';
import { logger } from '@/common/util/logger';
import { Content, ContentDocument } from './schemas/content.schema';
import { UserPlusContentService } from './user-plus-content.service';

@Injectable()
export class UserContentService {
  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
    private readonly userProfilesService: UserProfilesService,
    private readonly userPlusContentService: UserPlusContentService,
    private readonly openAIService: OpenAIUserService,
  ) {}

  /**
   * TRAFFIC COP: Route users to appropriate content based on subscription level
   * Get or generate user content for a specific date
   */
  async getOrGenerateUserContent(userId: string, date: string): Promise<ContentInterface> {
    logger.info('Routing user content request', { date, userId }, 'UserContentService');

    // Get userProfile to check subscription level
    const userProfile = await this.userProfilesService.findByFirebaseUid(userId);
    if (!userProfile) {
      throw new NotFoundException("Unable to load User Profile");
    }

    // ROUTING LOGIC: Route based on subscription level
    switch (userProfile.subscription.level) {
      case SubscriptionLevel.PLUS:
        logger.debug('Routing PLUS user to plus content service', { userId, date }, 'UserContentService');
        return await this.userPlusContentService.getOrGeneratePlusContent(userProfile, date);
      
      case SubscriptionLevel.PRO:
        // TODO: Route to UserProContentService when implemented
        // For now, PRO users get PLUS content
        logger.debug('Routing PRO user to plus content service (fallback)', { userId, date }, 'UserContentService');
        return await this.userPlusContentService.getOrGeneratePlusContent(userProfile, date);
      
      case SubscriptionLevel.USER:
      default:
        logger.debug('Routing USER to shared user content', { userId, date }, 'UserContentService');
        return await this.getOrGenerateSharedUserContent(userId, date);
    }
  }

  /**
   * Get or generate shared user content for FREE users
   * Content is shared by all free users, but we track who triggered generation
   */
  private async getOrGenerateSharedUserContent(userId: string, date: string): Promise<ContentInterface> {
    logger.info('Getting or generating shared user content', { date, userId }, 'UserContentService');

    // Get userProfile for content generation
    const userProfile = await this.userProfilesService.findByFirebaseUid(userId);
    if (!userProfile) {
      throw new NotFoundException("Unable to load User Profile");
    }

    // Check if shared user content exists for this date (regardless of userId)
    const existing = await this.findSharedUserContentByDate(date);
    if (existing) {
      logger.info('Shared user content found in database', { 
        date, 
        requestingUser: userId,
        originalTrigger: existing.userId 
      }, 'UserContentService');
      return existing;
    }

    // Generate new shared user content (this user is first to request today)
    logger.info('User is first to request content today, triggering generation', { 
      date, 
      triggeringUser: userId 
    }, 'UserContentService');
    
    return await this.generateSharedUserContent(date, userProfile);
  }

  /**
   * Find shared user content by date (shared among all FREE users)
   * Returns the same content regardless of who's requesting
   */
  async findSharedUserContentByDate(date: string): Promise<ContentInterface | null> {
    logger.debug('Finding shared user content by date', { date }, 'UserContentService');

    const content = await this.contentModel.findOne({ 
      date, 
      type: 'user_content' 
    }).exec();

    if (!content) {
      logger.debug('Shared user content not found', { date }, 'UserContentService');
      return null;
    }
    
    logger.debug('Found shared user content for date', { 
      date, 
      originalTrigger: content.userId 
    }, 'UserContentService');
    
    return this.transformToUserContent(content);
  }

  /**
   * Generate shared user content for a specific date using OpenAI
   * Content is shared among ALL free users, userId tracks who triggered generation
   */
  async generateSharedUserContent(date: string, triggeringUserProfile: UserProfile): Promise<ContentInterface> {
    logger.info('Generating new shared user content with OpenAI', { 
      date, 
      triggeringUserId: triggeringUserProfile.firebaseUid 
    }, 'UserContentService');

    // Create content record (userId tracks who triggered generation)
    const contentData = {
      type: 'user_content' as const,
      date,
      userId: triggeringUserProfile.firebaseUid,
      title: 'Generating...',
      message: 'Generating...',
      data: [],
      sources: [],
      status: 'pending' as const,
      generatedAt: new Date(),
      generationDuration: 0
    };

    const validation = validateContentInputSafe(contentData);
    if (!validation.success) {
      throw validation.error;
    }

    const content = new this.contentModel(validation.data);
    const savedContent = await content.save();

    // Wait for OpenAI to generate content
    const updatedContent = await this.openAIService.generateUserContent(triggeringUserProfile, date, savedContent);

    return this.transformToUserContent(updatedContent);
  }

  /**
   * Get today's user content (convenience method)
   */
  async getTodaysUserContent(userId: string): Promise<ContentInterface> {
    const today = new Date().toISOString().split('T')[0];
    return this.getOrGenerateUserContent(userId, today);
  }

  /**
   * Check if user can access content for a specific tier and date
   * This method provides content access validation across all tiers
   */
  canAccessContentForDate(user: UserProfile, date: string, contentTier: SubscriptionLevel): boolean {
    logger.debug('Checking content access for user', {
      userId: user.firebaseUid,
      userTier: user.subscription.level,
      contentTier,
      date
    }, 'UserContentService');

    // Use the helper method from UserProfilesService
    return this.userProfilesService.canAccessTierContent(user, date, contentTier);
  }

  // Admin methods for pagination/stats
  async getTotal(): Promise<number> {
    return await this.contentModel.countDocuments({ type: 'user_content' });
  }

  async findAll(queryRaw: BaseAdminQuery): Promise<ContentInterface[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
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

  /**
   * Get total count of content triggered by a specific user
   * This includes user_content they triggered (shared) and plus_content they own (personal)
   */
  async getTotalByUserId(userId: string): Promise<number> {
    return await this.contentModel.countDocuments({ userId });
  }

  /**
   * Find content associated with a specific user
   * This includes:
   * - user_content they triggered (shared with all free users)
   * - plus_content they own (personal)
   */
  async findByUserId(userId: string, queryRaw: BaseAdminQuery): Promise<ContentInterface[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
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
      
      // userId meaning depends on content type:
      // - user_content: who triggered the shared content generation
      // - plus_content: who owns the personal content
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