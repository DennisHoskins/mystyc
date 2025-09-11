import { Controller, Get, UseGuards, Query } from '@nestjs/common';

import { AuthEvent } from 'mystyc-common/schemas/auth-event.schema';
import { UserRole } from 'mystyc-common/constants';
import { BaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { AuthEventsSummary } from 'mystyc-common/admin/interfaces/summary';
import { AdminListResponse } from 'mystyc-common/admin/';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthEventsService } from '@/auth-events/auth-events.service';
import { AdminController } from './admin.controller';
import { logger } from '@/common/util/logger';

@Controller('admin/auth-events')
export class AdminAuthEventsController extends AdminController<AuthEvent> {
  protected serviceName = 'AuthEvents';
  
  constructor(protected service: AuthEventsService) {
    super();
  }

  /**
   * Gets summary statistics for auth events
   * @returns Promise<{}> - Auth Events summary
   */
  @Get('/summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAuthEventsSummary(): Promise<AuthEventsSummary> {
    const [total, create, login, logout, serverLogout] = await Promise.all([
      this.service.getTotal(),
      this.service.getTotalByEvent("create"),
      this.service.getTotalByEvent("login"),
      this.service.getTotalByEvent("logout"),
      this.service.getTotalByEvent("server-logout")
    ]);

    return {
      create,
      login,
      logout,
      serverLogout,
      total,
    };
  }

  /**
   * Gets auth events by type
   * @returns Promise<{}> - list of Auth Events
   */
  @Get('/create')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAuthEventsByTypeCreate(@Query() query: BaseAdminQuery): Promise<AdminListResponse<AuthEvent>> {
    return this.getByType("create", query)
  }

  @Get('/login')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAuthEventsByTypeLogin(@Query() query: BaseAdminQuery): Promise<AdminListResponse<AuthEvent>> {
    return this.getByType("login", query)
  }

  @Get('/logout')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAuthEventsByTypeLogout(@Query() query: BaseAdminQuery): Promise<AdminListResponse<AuthEvent>> {
    return this.getByType("logout", query)
  }

  @Get('/server-logout')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAuthEventsByTypeServerLogout(@Query() query: BaseAdminQuery): Promise<AdminListResponse<AuthEvent>> {
    return this.getByType("server-logout", query)
  }

  private async getByType(type: 'create' | 'login' | 'logout' | 'server-logout', @Query() query: BaseAdminQuery): Promise<AdminListResponse<AuthEvent>> {
    const [data, totalItems] = await Promise.all([
      this.service.findByEvent(type, query),
      this.service.getTotalByEvent(type)
    ])
    const totalPages = Math.ceil(totalItems / (query.limit || 100));
    
    logger.info(`Admin ${this.serviceName} list retrieved`, { 
      count: data.length 
    }, `Admin${this.serviceName}Controller`);

    logger.info("[AdminQuery]", query);

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