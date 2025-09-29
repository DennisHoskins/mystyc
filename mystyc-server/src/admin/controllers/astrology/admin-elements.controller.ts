import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from 'mystyc-common/constants';
import { logger } from '@/common/util/logger';
import { isErrorWithStatus } from '@/common/util/error';

import { Element, Sign } from 'mystyc-common/schemas';

import { ElementsService } from '@/astrology/services/elements.service';
import { SignsService } from '@/astrology/services/signs.service';
import { AdminController } from '../admin.controller';

@Controller('admin/elements')
export class AdminElementsController extends AdminController<Element> {
  protected serviceName = 'Elements';
  
  constructor(
    protected service: ElementsService,
    private readonly signsService: SignsService
  ) {
    super();
  }

  /**
   * Finds element by name, throws NotFoundException if not found (admin use)
   * @param element - Element name
   * @returns Promise<Element> - Element object
   * @throws NotFoundException when element not found
   */
  @Get(':element')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getElement(@Param('element') element: string) {
    logger.info('Admin fetching element by name', { element }, 'AdminElementsController');
    
    try {
      const result = await this.service.findByName(element);
      
      if (!result) {
        logger.warn('Element not found', { element }, 'AdminElementsController');
        throw new NotFoundException('Element not found');
      }

      logger.info('Element retrieved successfully', { 
        element, 
      }, 'AdminElementsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get element', {
        element,
        error
      }, 'AdminElementsController');
      
      throw error;
    }
  }

  /**
   * Finds all signs for a specific element
   * @param element - Element name
   * @returns Promise<Sign[]> - Array of signs for that element
   */
  @Get('signs/:element')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getElementSigns(@Param('element') element: string): Promise<Sign[]> {
    logger.info('Admin fetching signs for element', { element }, 'AdminElementsController');
    
    try {
      const signs = await this.signsService.findByElement(element);
      
      logger.info('Element signs retrieved successfully', { 
        element,
        count: signs.length
      }, 'AdminElementsController');
      
      return signs;
    } catch (error) {
      logger.error('Failed to get element signs', {
        element,
        error
      }, 'AdminElementsController');
      
      throw error;
    }
  }
}