import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from 'mystyc-common/constants';
import { logger } from '@/common/util/logger';
import { isErrorWithStatus } from '@/common/util/error';

import { Planet } from 'mystyc-common/schemas';

import { PlanetsService } from '@/astrology/services/planets.service';
import { AdminController } from '../admin.controller';

@Controller('admin/planets')
export class AdminPlanetsController extends AdminController<Planet> {
  protected serviceName = 'Planets';
  
  constructor(protected service: PlanetsService) {
    super();
  }


  /**
   * Finds planet by name, throws NotFoundException if not found (admin use)
   * @param planet - Planet name
   * @returns Promise<Planet> - Planet object
   * @throws NotFoundException when planet not found
   */
  @Get(':planet')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPlanet(@Param('planet') planet: string) {
    logger.info('Admin fetching planet by name', { planet }, 'AdminPlanetsController');
    
    try {
      const result = await this.service.findByName(planet);
      
      if (!result) {
        logger.warn('Planet not found', { planet }, 'AdminPlanetsController');
        throw new NotFoundException('Planet not found');
      }

      logger.info('Planet retrieved successfully', { 
        planet, 
      }, 'AdminPlanetsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get planet', {
        planet,
        error
      }, 'AdminPlanetsController');
      
      throw error;
    }
  }
}