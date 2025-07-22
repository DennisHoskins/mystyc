import { Controller, Get, Post, UseGuards, Param, Query, Body, NotFoundException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from 'mystyc-common/constants/roles.enum';
import { FirebaseUser } from 'mystyc-common/schemas/';
import { FirebaseUser as FirebaseUserDecorator } from '@/common/decorators/user.decorator';
import { UserProfilesService } from '@/users/user-profiles.service';
import { ContentService } from '@/content/content.service';
import { UserContentService } from '@/content/user-content.service';
import { Content } from 'mystyc-common/schemas';
import { AdminController } from './admin.controller';
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
}