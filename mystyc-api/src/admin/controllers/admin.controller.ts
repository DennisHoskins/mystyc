import { Get, Query, Param, UseGuards, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { BaseAdminQueryDto } from '../dto/base-admin-query.dto';
import { AdminListResponse } from '@/common/interfaces/adminQuery.interface';
import { logger } from '@/common/util/logger';

export abstract class AdminController<T> {
  protected abstract serviceName: string;
  protected abstract service: any;

  /**
   * Generic method to list all items with pagination and sorting
   * @param query - Query parameters for pagination, sorting, and filtering
   * @returns Promise<AdminListResponse<T>> - Paginated list response
   */
  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: BaseAdminQueryDto): Promise<AdminListResponse<T>> {
    logger.info(`Admin fetching ${this.serviceName} list`, { 
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    }, `Admin${this.serviceName}Controller`);

    const data = await this.service.findAll(query);
    
    logger.info(`Admin ${this.serviceName} list retrieved`, { 
      count: data.length 
    }, `Admin${this.serviceName}Controller`);

    return {
      data,
      pagination: {
        limit: query.limit || 50,
        offset: query.offset || 0,
        hasMore: data.length === (query.limit || 50)
      },
      sort: query.sortBy ? {
        field: query.sortBy,
        order: query.sortOrder || 'desc'
      } : undefined
    };
  }

  /**
   * Generic method to get a single item by ID
   * @param id - Item identifier
   * @returns Promise<T> - Single item
   * @throws NotFoundException when item not found
   */
  @Get(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findById(@Param('id') id: string): Promise<T> {
    logger.info(`Admin fetching ${this.serviceName} by ID`, { id }, `Admin${this.serviceName}Controller`);

    const item = await this.service.findById(id);
    
    if (!item) {
      logger.warn(`${this.serviceName} not found`, { id }, `Admin${this.serviceName}Controller`);
      throw new NotFoundException(`${this.serviceName} not found`);
    }

    logger.info(`${this.serviceName} retrieved successfully`, { id }, `Admin${this.serviceName}Controller`);
    return item;
  }
}