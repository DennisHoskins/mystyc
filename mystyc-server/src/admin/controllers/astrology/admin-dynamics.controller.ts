import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from 'mystyc-common/constants';
import { logger } from '@/common/util/logger';
import { isErrorWithStatus } from '@/common/util/error';
import { Dynamic } from 'mystyc-common/schemas';
import { DynamicsService } from '@/astrology/services/dynamics.service';
import { AdminController } from '../admin.controller';

@Controller('admin/dynamics')
export class AdminDynamicsController extends AdminController<Dynamic> {
  protected serviceName = 'Dynamics';
  
  constructor(protected service: DynamicsService) {
    super();
  }

  /**
   * Finds dynamic by name, throws NotFoundException if not found (admin use)
   * @param dynamic - Dynamic name
   * @returns Promise<Dynamic> - Dynamic object
   * @throws NotFoundException when dynamic not found
   */
  @Get(':dynamic')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDynamic(@Param('dynamic') dynamic: string) {
    logger.info('Admin fetching dynamic by name', { dynamic }, 'AdminDynamicsController');
    
    try {
      const result = await this.service.findByName(dynamic);
      
      if (!result) {
        logger.warn('Dynamic not found', { dynamic }, 'AdminDynamicsController');
        throw new NotFoundException('Dynamic not found');
      }

      logger.info('Dynamic retrieved successfully', { 
        dynamic, 
      }, 'AdminDynamicsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get dynamic', {
        dynamic,
        error
      }, 'AdminDynamicsController');
      
      throw error;
    }
  }
}