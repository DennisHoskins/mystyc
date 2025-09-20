import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { PolarityInteraction } from 'mystyc-common/schemas';
import { UserRole } from 'mystyc-common/constants';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { logger } from '@/common/util/logger';
import { isErrorWithStatus } from '@/common/util/error';

import { PolarityInteractionsService } from '@/astrology/services/polarity-interactions.service';
import { AdminController } from '../admin.controller';

@Controller('admin/polarity-interactions')
export class AdminPolarityInteractionsController extends AdminController<PolarityInteraction> {
  protected serviceName = 'PolarityInteractions';
  
  constructor(protected service: PolarityInteractionsService) {
    super();
  }

  @Get('polarity-interaction/:polarity1/:polarity2')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPolarityInteraction(
    @Param('polarity1') polarity1: string, 
    @Param('polarity2') polarity2: string
  ): Promise<PolarityInteraction> {
    logger.info('Admin fetching polarity interaction', { polarity1, polarity2 }, 'AdminPolarityInteractionsController');
    
    try {
      const result = await this.service.findByPolarities(polarity1, polarity2);
      
      if (!result) {
        throw new NotFoundException(`No polarity interaction found for: ${polarity1}-${polarity2}`);
      }
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get polarity interaction', { polarity1, polarity2, error }, 'AdminPolarityInteractionsController');
      throw error;
    }
  }

  /**
   * Finds polarity interactions by polarity, throws NotFoundException if not found (admin use)
   * @param polarity - polarity name
   * @returns Promise<PolarityInteraction[]> - Array of polarity interaction objects
   * @throws NotFoundException when no polarity interactions found for the polarity
   */
  @Get('polarities/:polarity')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPolarityInteractionsByPolarity(@Param('polarity') polarity: string): Promise<PolarityInteraction[]> {
    logger.info('Admin fetching polarity interactions by polarity', { polarity }, 'AdminPolarityInteractionsController');
    
    try {
      const result = await this.service.findByPolarity(polarity);
      
      if (!result || result.length === 0) {
        logger.warn('No polarity interactions found for polarity', { polarity }, 'AdminPolarityInteractionsController');
        throw new NotFoundException(`No polarity interactions found for polarity: ${polarity}`);
      }

      logger.info('Polarity interactions retrieved successfully', { 
        polarity,
        count: result.length
      }, 'AdminPolarityInteractionsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get polarity interactions by polarity', {
        polarity,
        error
      }, 'AdminPolarityInteractionsController');
      
      throw error;
    }
  }

  /**
   * Finds polarity interactions by dynamic, throws NotFoundException if not found (admin use)
   * @param dynamic - dynamic name
   * @returns Promise<PolarityInteraction[]> - Array of polarity interaction objects
   * @throws NotFoundException when no polarity interactions found for the dynamic
   */
  @Get('dynamics/:dynamic')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPolarityInteractionsByDynamic(@Param('dynamic') dynamic: string): Promise<PolarityInteraction[]> {
    logger.info('Admin fetching polarity interactions by dynamic', { dynamic }, 'AdminPolarityInteractionsController');
    
    try {
      const result = await this.service.findByDynamic(dynamic);
      
      if (!result || result.length === 0) {
        logger.warn('No polarity interactions found for dynamic', { dynamic }, 'AdminPolarityInteractionsController');
        throw new NotFoundException(`No polarity interactions found for dynamic: ${dynamic}`);
      }

      logger.info('Polarity interactions retrieved successfully', { 
        dynamic,
        count: result.length
      }, 'AdminPolarityInteractionsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get polarity interactions by dynamic', {
        dynamic,
        error
      }, 'AdminPolarityInteractionsController');
      
      throw error;
    }
  }
}