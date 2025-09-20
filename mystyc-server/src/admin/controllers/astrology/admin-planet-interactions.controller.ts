import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { PlanetInteraction } from 'mystyc-common/schemas';
import { UserRole } from 'mystyc-common/constants';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { logger } from '@/common/util/logger';
import { isErrorWithStatus } from '@/common/util/error';

import { PlanetInteractionsService } from '@/astrology/services/planet-interactions.service';
import { AdminController } from '../admin.controller';

@Controller('admin/planet-interactions')
export class AdminPlanetInteractionsController extends AdminController<PlanetInteraction> {
  protected serviceName = 'PlanetInteractions';
  
  constructor(protected service: PlanetInteractionsService) {
    super();
  }

  @Get('planet-interaction/:planet1/:planet2')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPlanetInteraction(
    @Param('planet1') planet1: string, 
    @Param('planet2') planet2: string
  ): Promise<PlanetInteraction> {
    logger.info('Admin fetching planet interaction', { planet1, planet2 }, 'AdminPlanetInteractionsController');
    
    try {
      const result = await this.service.findByPlanets(planet1, planet2);
      
      if (!result) {
        throw new NotFoundException(`No planet interaction found for: ${planet1}-${planet2}`);
      }
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get planet interaction', { planet1, planet2, error }, 'AdminPlanetInteractionsController');
      throw error;
    }
  }

  /**
   * Finds planet interactions by planet, throws NotFoundException if not found (admin use)
   * @param planet - planet name
   * @returns Promise<PlanetInteraction[]> - Array of planet interactions objects
   * @throws NotFoundException when no planet interactions found for the planet
   */
  @Get('planets/:planet')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPlanetInteractionsByPlanet(@Param('planet') planet: string): Promise<PlanetInteraction[]> {
    logger.info('Admin fetching planet interactions by planet', { planet }, 'AdminPlanetInteractionsController');
    
    try {
      const result = await this.service.findByPlanet(planet);
      
      if (!result || result.length === 0) {
        logger.warn('No planet interactions found for planet', { planet }, 'AdminPlanetInteractionsController');
        throw new NotFoundException(`No planet interactions found for planet: ${planet}`);
      }

      logger.info('Planet interactions retrieved successfully', { 
        planet,
        count: result.length
      }, 'AdminPlanetInteractionsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get planet interactions by planet', {
        planet,
        error
      }, 'AdminPlanetInteractionsController');
      
      throw error;
    }
  }

  /**
   * Finds planet interactions by dynamic, throws NotFoundException if not found (admin use)
   * @param dynamic - dynamic name
   * @returns Promise<PlanetInteraction[]> - Array of planet interaction objects
   * @throws NotFoundException when no planet interactions found for the dynamic
   */
  @Get('dynamics/:dynamic')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPlanetInteractionsByDynamic(@Param('dynamic') dynamic: string): Promise<PlanetInteraction[]> {
    logger.info('Admin fetching planet interactions by dynamic', { dynamic }, 'AdminPlanetInteractionsController');
    
    try {
      const result = await this.service.findByDynamic(dynamic);
      
      if (!result || result.length === 0) {
        logger.warn('No planet interactions found for dynamic', { dynamic }, 'AdminPlanetInteractionsController');
        throw new NotFoundException(`No planet interactions found for dynamic: ${dynamic}`);
      }

      logger.info('Planet interactions retrieved successfully', { 
        dynamic,
        count: result.length
      }, 'AdminPlanetInteractionsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get planet interactions by dynamic', {
        dynamic,
        error
      }, 'AdminPlanetInteractionsController');
      
      throw error;
    }
  }
}