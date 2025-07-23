import { Controller, Get, Post, UseGuards, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Content } from 'mystyc-common/schemas';
import { UserRole } from 'mystyc-common/constants/roles.enum';
import { BaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses/admin-list-response.interface';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { logger } from '@/common/util/logger';
import { ContentService } from '@/content/content.service';
import { WebsiteContentService } from '@/content/website-content.service';
import { AdminController } from './admin.controller';

@Controller('admin/content-website')
export class AdminWebsiteContentController extends AdminController<Content> {
  protected serviceName = 'AdminWebsiteContent';
  
  constructor(
    protected service: ContentService,
    private readonly websiteContentService: WebsiteContentService,
  ) {
    super();
  }

  /**
   * Finds all website content
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<Content>> - Paginated list of website content
   */
  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getWebsiteContent(
    @Query() query: BaseAdminQuery
  ): Promise<AdminListResponse<Content>> {
    logger.info('Admin fetching website content', { 
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, 'AdminWebsitecontentController');
    
    const [data, totalItems] = await Promise.all([

      this.websiteContentService.findAll(query),
      this.websiteContentService.getTotal()

    ]);
    
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info('Website content retrieved', { 
      count: data.length,
      totalItems
    }, 'AdminWebsiteContentController');
    
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
   * Creates website content from OpenAI
   * @param prompt: The prompt sent to OpenAI to generate the content
   * @returns Promise<Content> - New content object
   */
  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createContent(): Promise<Content> {
    logger.info('Admin create Website Content Begin', {}, 'AdminWebsiteContentController');

    const today = new Date().toISOString().split('T')[0];
    const result = await this.websiteContentService.generateWebsiteContent(today);

    logger.info('Admin create Website Content Complete', {}, 'AdminWebsiteContentController');

    return result;
  }
}