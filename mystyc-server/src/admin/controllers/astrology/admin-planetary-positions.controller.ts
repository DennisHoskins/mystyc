import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { PlanetaryPosition } from 'mystyc-common/schemas';
import { UserRole } from 'mystyc-common/constants';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { logger } from '@/common/util/logger';
import { isErrorWithStatus } from '@/common/util/error';
import { PlanetaryPositionsService } from '@/astrology/services/planetary-positions.service';
import { AdminController } from '../admin.controller';

@Controller('admin/planetary-positions')
export class AdminPlanetaryPositionsController extends AdminController<PlanetaryPosition> {
  protected serviceName = 'PlanetaryPositions';
  
  constructor(protected service: PlanetaryPositionsService) {
    super();
  }

  @Get('planetary-position/:planet/:sign')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getElementInteraction(
    @Param('planet') planet: string, 
    @Param('sign') sign: string
  ): Promise<PlanetaryPosition> {
    logger.info('Admin fetching planetary position', { planet, sign }, 'AdminPlanetaryPositionsController');
    
    try {
      const result = await this.service.findByPosition(planet, sign);
      
      if (!result) {
        throw new NotFoundException(`No planetary position found for: ${planet}-${sign}`);
      }
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get planetary position', { planet, sign, error }, 'AdminPlanetaryPositionsController');
      throw error;
    }
  }

  /**
   * Finds planetary positions by planet, throws NotFoundException if not found (admin use)
   * @param planet - planet name
   * @returns Promise<PlanetaryPosition[]> - Array of planetary position objects
   * @throws NotFoundException when no planetary positions found for the sign
   */
  @Get('planets/:planet')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPlanetaryPositionsByPlanet(@Param('planet') planet: string): Promise<PlanetaryPosition[]> {
    logger.info('Admin fetching planetary positions by planet', { planet }, 'AdminPlanetaryPositionsController');
    
    try {
      const result = await this.service.findByPlanet(planet);
      
      if (!result || result.length === 0) {
        logger.warn('No planetary positions found for planet', { planet }, 'AdminPlanetaryPositionsController');
        throw new NotFoundException(`No planetary positions found for planet: ${planet}`);
      }

      logger.info('Planetary positions retrieved successfully', { 
        planet,
        count: result.length
      }, 'AdminPlanetaryPositionsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get planetary positions by planet', {
        planet,
        error
      }, 'AdminPlanetaryPositionsController');
      
      throw error;
    }
  }

  /**
   * Finds planetary positions by zodiac sign, throws NotFoundException if not found (admin use)
   * @param zodiacSign - Zodiac sign name
   * @returns Promise<PlanetaryPosition[]> - Array of planetary position objects
   * @throws NotFoundException when no planetary positions found for the sign
   */
  @Get('signs/:zodiacSign')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPlanetaryPositionsBySign(@Param('zodiacSign') zodiacSign: string): Promise<PlanetaryPosition[]> {
    logger.info('Admin fetching planetary positions by zodiac sign', { zodiacSign }, 'AdminPlanetaryPositionsController');
    
    try {
      const result = await this.service.findByZodiacSign(zodiacSign);
      
      if (!result || result.length === 0) {
        logger.warn('No planetary positions found for zodiac sign', { zodiacSign }, 'AdminPlanetaryPositionsController');
        throw new NotFoundException(`No planetary positions found for zodiac sign: ${zodiacSign}`);
      }

      logger.info('Planetary positions retrieved successfully', { 
        zodiacSign,
        count: result.length
      }, 'AdminPlanetaryPositionsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get planetary positions by zodiac sign', {
        zodiacSign,
        error
      }, 'AdminPlanetaryPositionsController');
      
      throw error;
    }
  }
}