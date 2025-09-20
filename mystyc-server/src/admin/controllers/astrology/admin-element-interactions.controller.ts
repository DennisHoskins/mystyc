import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { ElementInteraction } from 'mystyc-common/schemas';
import { UserRole } from 'mystyc-common/constants';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { logger } from '@/common/util/logger';
import { isErrorWithStatus } from '@/common/util/error';
import { ElementInteractionsService } from '@/astrology/services/element-interactions.service';
import { AdminController } from '../admin.controller';

@Controller('admin/element-interactions')
export class AdminElementInteractionsController extends AdminController<ElementInteraction> {
  protected serviceName = 'ElementInteractions';
  
  constructor(protected service: ElementInteractionsService) {
    super();
  }

  @Get('element-interaction/:element1/:element2')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getElementInteraction(
    @Param('element1') element1: string, 
    @Param('element2') element2: string
  ): Promise<ElementInteraction> {
    logger.info('Admin fetching element interaction', { element1, element2 }, 'AdminElementInteractionsController');
    
    try {
      const result = await this.service.findByElements(element1, element2);
      
      if (!result) {
        throw new NotFoundException(`No element interaction found for: ${element1}-${element2}`);
      }
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get element interaction', { element1, element2, error }, 'AdminElementInteractionsController');
      throw error;
    }
  }

  /**
   * Finds element interactions by element, normalizing so queried element is always element1
   * @param element - Element name (Fire, Earth, Air, Water)
   * @returns Promise<ElementInteraction[]> - Array of element interactions with queried element as element1
   * @throws NotFoundException when no interactions found for the element
   */
  @Get('elements/:element')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getElementInteractionsByElement(@Param('element') element: string): Promise<ElementInteraction[]> {
    logger.info('Admin fetching element interactions by element', { element }, 'AdminElementInteractionsController');
    
    try {
      const result = await this.service.findByElement(element);
      
      if (!result || result.length === 0) {
        logger.warn('No element interactions found for element', { element }, 'AdminElementInteractionsController');
        throw new NotFoundException(`No element interactions found for element: ${element}`);
      }

      logger.info('Element interactions retrieved successfully', { 
        element,
        count: result.length
      }, 'AdminElementInteractionsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get element interactions by element', {
        element,
        error
      }, 'AdminElementInteractionsController');
      
      throw error;
    }
  }

  /**
   * Finds element interactions by dynamic
   * @param dynamic - Dynamic name
   * @returns Promise<ElementInteraction[]> - Array of element interactions
   * @throws NotFoundException when no interactions found for the dynamic
   */
  @Get('dynamics/:dynamic')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getElementInteractionsByDynamic(@Param('dynamic') dynamic: string): Promise<ElementInteraction[]> {
    logger.info('Admin fetching element interactions by dynamic', { dynamic }, 'AdminElementInteractionsController');
    
    try {
      const result = await this.service.findByDynamic(dynamic);
      
      if (!result || result.length === 0) {
        logger.warn('No element interactions found for dynamic', { dynamic }, 'AdminElementInteractionsController');
        throw new NotFoundException(`No element interactions found for dynamic: ${dynamic}`);
      }

      logger.info('Element interactions retrieved successfully', { 
        dynamic,
        count: result.length
      }, 'AdminElementInteractionsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get element interactions by dynamic', {
        dynamic,
        error
      }, 'AdminElementInteractionsController');
      
      throw error;
    }
  }
}