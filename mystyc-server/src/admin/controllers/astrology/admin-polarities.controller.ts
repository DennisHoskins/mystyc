import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from 'mystyc-common/constants';
import { logger } from '@/common/util/logger';
import { isErrorWithStatus } from '@/common/util/error';

import { Polarity } from 'mystyc-common/schemas';

import { PolaritiesService } from '@/astrology/services/polarities.service';
import { AdminController } from '../admin.controller';

@Controller('admin/polarities')
export class AdminPolaritiesController extends AdminController<Polarity> {
  protected serviceName = 'Polarities';
  
  constructor(protected service: PolaritiesService) {
    super();
  }

  /**
   * Finds polarity by name, throws NotFoundException if not found (admin use)
   * @param polarity - Polarity name
   * @returns Promise<Polarity> - Polarity object
   * @throws NotFoundException when polarity not found
   */
  @Get(':polarity')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPolarity(@Param('polarity') polarity: string) {
    logger.info('Admin fetching polarity by name', { polarity }, 'AdminPolaritiesController');
    
    try {
      const result = await this.service.findByName(polarity);
      
      if (!result) {
        logger.warn('Polarity not found', { polarity }, 'AdminPolaritiesController');
        throw new NotFoundException('Polarity not found');
      }

      logger.info('Polarity retrieved successfully', { 
        polarity, 
      }, 'AdminPolaritiesController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get polarity', {
        polarity,
        error
      }, 'AdminPolaritiesController');
      
      throw error;
    }
  }
}