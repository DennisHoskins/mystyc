import { Controller, Get, Post, UseGuards, Param, Query, Body, NotFoundException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { FirebaseUser } from '@/common/interfaces/firebase-user.interface';
import { FirebaseUser as FirebaseUserDecorator } from '@/common/decorators/user.decorator';
import { UserProfilesService } from '@/users/user-profiles.service';
import { ContentService } from '@/content/content.service';
import { UserContentService } from '@/content/user-content.service';
import { Content } from '@/common/interfaces/content.interface';
import { AdminController } from './admin.controller';
import { CreateContentDto } from '@/content/dto/create-content.dto';
import { BaseAdminQueryDto } from '../dto/base-admin-query.dto';
import { AdminListResponse } from '@/common/interfaces/admin/admin-list-response.interface';
import { logger } from '@/common/util/logger';

@Controller('admin/content-users')
export class AdminUsersContentController extends AdminController<Content> {
  protected serviceName = 'AdminUsersContent';
  
  constructor(
    protected service: ContentService,
    private readonly userContentService: UserContentService,
    private readonly userProfilesService: UserProfilesService,
  ) {
    super();
  }

  /**
   * Finds all user content
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<Content>> - Paginated list of user content
   */
  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserContent(
    @Query() query: BaseAdminQueryDto
  ): Promise<AdminListResponse<Content>> {
    logger.info('Admin fetching user content', { 
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminUserContentController');
    
    const [data, totalItems] = await Promise.all([

      this.userContentService.findAll(query),
      this.userContentService.getTotal()

    ]);
    
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info('User content retrieved', { 
      count: data.length,
      totalItems
    }, 'AdminUserContentController');
    
    return {
      data,
      pagination: {
        limit: query.limit || 100,
        offset: query.offset || 0,
        hasMore: data.length === (query.limit || 100),
        totalItems,
        totalPages
      },
      sort: query.sortBy ? {
        field: query.sortBy,
        order: query.sortOrder || 'desc'
      } : undefined
    };
  }

  /**
   * Creates user content from OpenAI
   * @param prompt: The prompt sent to OpenAI to generate the content
   * @returns Promise<Content> - New content object
   */
  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createContent(
    @Body() createContentDto: CreateContentDto,
    @FirebaseUserDecorator() user: FirebaseUser
  ): Promise<Content> {
    const prompt = createContentDto.prompt || "This is my default prompt";

    logger.info('Admin create Content', {
      adminUid: user.uid,
      prompt: 'prompt: ' + prompt,
    }, 'AdminUserContentController');

    // Get userProfile
    const userProfile = await this.userProfilesService.findByFirebaseUid(user.uid);
    if (!userProfile) {
      throw new NotFoundException("Unable to load User Profile");
    }

    const today = new Date().toISOString().split('T')[0];

    const result = await this.userContentService.generateUserContent(today, userProfile);

    return result;
  }
}