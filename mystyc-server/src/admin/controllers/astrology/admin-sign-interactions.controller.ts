import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { SignInteraction } from 'mystyc-common/schemas';
import { UserRole } from 'mystyc-common/constants';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { logger } from '@/common/util/logger';
import { isErrorWithStatus } from '@/common/util/error';

import { SignInteractionsService } from '@/astrology/services/sign-interactions.service';
import { AdminController } from '../admin.controller';

@Controller('admin/sign-interactions')
export class AdminSignInteractionsController extends AdminController<SignInteraction> {
  protected serviceName = 'SignInteractions';
  
  constructor(protected service: SignInteractionsService) {
    super();
  }

  @Get('sign-interaction/:sign1/:sign2')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSignInteraction(
    @Param('sign1') sign1: string, 
    @Param('sign2') sign2: string
  ): Promise<SignInteraction> {
    logger.info('Admin fetching sign interaction', { sign1, sign2 }, 'AdminSignInteractionsController');
    
    try {
      const result = await this.service.findBySigns(sign1, sign2);
      
      if (!result) {
        throw new NotFoundException(`No sign interaction found for: ${sign1}-${sign2}`);
      }
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get sign interaction', { sign1, sign2, error }, 'AdminSignInteractionsController');
      throw error;
    }
  }

  /**
   * Finds sign interactions by sign, throws NotFoundException if not found (admin use)
   * @param sign - sign name
   * @returns Promise<SignInteraction[]> - Array of sign interactions objects
   * @throws NotFoundException when no sign interactions found for the sign
   */
  @Get('signs/:sign')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSignInteractionsBySign(@Param('sign') sign: string): Promise<SignInteraction[]> {
    logger.info('Admin fetching sign interactions by sign', { sign }, 'AdminSignInteractionsController');
    
    try {
      const result = await this.service.findBySign(sign);
      
      if (!result || result.length === 0) {
        logger.warn('No sign interactions found for sign', { sign }, 'AdminSignInteractionsController');
        throw new NotFoundException(`No sign interactions found for sign: ${sign}`);
      }

      logger.info('Sign interactions retrieved successfully', { 
        sign,
        count: result.length
      }, 'AdminSignInteractionsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get sign interactions by sign', {
        sign,
        error
      }, 'AdminSignInteractionsController');
      
      throw error;
    }
  }

  /**
   * Finds sign interactions by dynamic, throws NotFoundException if not found (admin use)
   * @param dynamic - dynamic name
   * @returns Promise<SignInteraction[]> - Array of sign interaction objects
   * @throws NotFoundException when no sign interactions found for the dynamic
   */
  @Get('dynamics/:dynamic')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSignInteractionsByDynamic(@Param('dynamic') dynamic: string): Promise<SignInteraction[]> {
    logger.info('Admin fetching sign interactions by dynamic', { dynamic }, 'AdminSignInteractionsController');
    
    try {
      const result = await this.service.findByDynamic(dynamic);
      
      if (!result || result.length === 0) {
        logger.warn('No sign interactions found for dynamic', { dynamic }, 'AdminSignInteractionsController');
        throw new NotFoundException(`No sign interactions found for dynamic: ${dynamic}`);
      }

      logger.info('Sign interactions retrieved successfully', { 
        dynamic,
        count: result.length
      }, 'AdminSignInteractionsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get sign interactions by dynamic', {
        dynamic,
        error
      }, 'AdminSignInteractionsController');
      
      throw error;
    }
  }
}