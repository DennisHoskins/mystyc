import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from 'mystyc-common/constants';
import { logger } from '@/common/util/logger';
import { isErrorWithStatus } from '@/common/util/error';

import { House } from 'mystyc-common/schemas';

import { HousesService } from '@/astrology/services/houses.service';
import { AdminController } from '../admin.controller';

@Controller('admin/houses')
export class AdminHousesController extends AdminController<House> {
  protected serviceName = 'Houses';
  
  constructor(protected service: HousesService) {
    super();
  }

  /**
   * Finds house by number, throws NotFoundException if not found (admin use)
   * @param house - House number
   * @returns Promise<House> - House object
   * @throws NotFoundException when house not found
   */
  @Get(':house')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getHouse(@Param('house') house: number) {
    logger.info('Admin fetching house by name', { house }, 'AdminHousesController');
    
    try {
      const result = await this.service.findByNumber(house);
      
      if (!result) {
        logger.warn('House not found', { house }, 'AdminHousesController');
        throw new NotFoundException('House not found');
      }

      logger.info('House retrieved successfully', { 
        house, 
      }, 'AdminHousesController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get house', {
        house,
        error
      }, 'AdminHousesController');
      
      throw error;
    }
  }
}