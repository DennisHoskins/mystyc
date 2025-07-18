import { Controller, Get, UseGuards, Query } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { UserProfilesService } from '@/users/user-profiles.service';
import { User } from '@/common/interfaces/user.interface';
import { UserProfile } from '@/common/interfaces/user-profile.interface';
import { AdminController } from './admin.controller';
import { BaseAdminQueryDto } from '../dto/base-admin-query.dto';
import { AdminListResponse } from '@/common/interfaces/admin/admin-list-response.interface';
import { logger } from '@/common/util/logger';
import { SubscriptionLevel } from '@/common/enums/subscription-levels.enum';

@Controller('admin/users-plus')
export class AdminUsersPlusController extends AdminController<UserProfile> {
  protected serviceName = 'UsersPlus';
  
  constructor(protected service: UserProfilesService) {
    super();
  }

  /**
   * Finds all users subscribed to mystyc plus
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<UserProfile>> - Paginated list of user profiles
   */
  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPlusUsers(
    @Query() query: BaseAdminQueryDto
  ): Promise<AdminListResponse<UserProfile>> {
    logger.info('Admin fetching user plus content', { 
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminUserPlusController');
    
    const [data, totalItems] = await Promise.all([

      this.service.findBySubscriptionTier(SubscriptionLevel.PLUS, query),
      this.service.getTotalBySubscriptionTier(SubscriptionLevel.PLUS)

    ]);
    
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info('UserPlus content retrieved', { 
      count: data.length,
      totalItems
    }, 'AdminContentController');
    
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