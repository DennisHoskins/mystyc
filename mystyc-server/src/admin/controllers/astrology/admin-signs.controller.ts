import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from 'mystyc-common/constants';
import { logger } from '@/common/util/logger';
import { isErrorWithStatus } from '@/common/util/error';

import { Sign } from 'mystyc-common/schemas';

import { SignsService } from '@/astrology/services/signs.service';
import { AdminController } from '../admin.controller';

@Controller('admin/signs')
export class AdminSignsController extends AdminController<Sign> {
  protected serviceName = 'Signs';
  
  constructor(protected service: SignsService) {
    super();
  }


  /**
   * Finds signs by modality
   * @param modality - Modality name (Cardinal, Fixed, etc)
   * @returns Promise<Sign[]> - Array of signs
   * @throws NotFoundException when no signs found for the modality
   */
  @Get('modalities/:modality')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSignsByModality(@Param('modality') modality: string): Promise<Sign[]> {
    logger.info('Admin fetching signs by modality', { modality }, 'AdminSignsController');
    
    try {
      const result = await this.service.findByModality(modality);
      
      if (!result || result.length === 0) {
        logger.warn('No signs found for modality', { modality }, 'AdminSignsController');
        throw new NotFoundException(`No signs found for modality: ${modality}`);
      }

      logger.info('Modality signs retrieved successfully', { 
        modality,
        count: result.length
      }, 'AdminSignsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get signs by modality', {
        modality,
        error
      }, 'AdminSignsController');
      
      throw error;
    }
  }  

  /**
   * Finds sign by name, throws NotFoundException if not found (admin use)
   * @param sign - Sign name
   * @returns Promise<Sign> - Sign object
   * @throws NotFoundException when sign not found
   */
  @Get(':sign')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSign(@Param('sign') sign: string) {
    logger.info('Admin fetching sign by name', { sign }, 'AdminSignsController');
    
    try {
      const result = await this.service.findByName(sign);
      
      if (!result) {
        logger.warn('Sign not found', { sign }, 'AdminSignsController');
        throw new NotFoundException('Sign not found');
      }

      logger.info('Sign retrieved successfully', { 
        sign, 
      }, 'AdminSignsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get sign', {
        sign,
        error
      }, 'AdminSignsController');
      
      throw error;
    }
  }
}