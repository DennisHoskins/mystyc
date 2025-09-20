import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { ModalityInteraction } from 'mystyc-common/schemas';
import { UserRole } from 'mystyc-common/constants';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { logger } from '@/common/util/logger';
import { isErrorWithStatus } from '@/common/util/error';

import { ModalityInteractionsService } from '@/astrology/services/modality-interactions.service';
import { AdminController } from '../admin.controller';

@Controller('admin/modality-interactions')
export class AdminModalityInteractionsController extends AdminController<ModalityInteraction> {
  protected serviceName = 'ModalityInteractions';
  
  constructor(protected service: ModalityInteractionsService) {
    super();
  }

  @Get('modality-interaction/:modality1/:modality2')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getModalityInteraction(
    @Param('modality1') modality1: string, 
    @Param('modality2') modality2: string
  ): Promise<ModalityInteraction> {
    logger.info('Admin fetching modality interaction', { modality1, modality2 }, 'AdminModalityInteractionsController');
    
    try {
      const result = await this.service.findByModalities(modality1, modality2);
      
      if (!result) {
        throw new NotFoundException(`No modality interaction found for: ${modality1}-${modality2}`);
      }
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get modality interaction', { modality1, modality2, error }, 'AdminModalityInteractionsController');
      throw error;
    }
  }

  /**
   * Finds modality interactions by modality, throws NotFoundException if not found (admin use)
   * @param modality - modality name
   * @returns Promise<ModalityInteraction[]> - Array of modality interaction objects
   * @throws NotFoundException when no modality interactions found for the modality
   */
  @Get('modalities/:modality')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getModalityInteractionsByModality(@Param('modality') modality: string): Promise<ModalityInteraction[]> {
    logger.info('Admin fetching modality interactions by modality', { modality }, 'AdminModalityInteractionsController');
    
    try {
      const result = await this.service.findByModality(modality);
      
      if (!result || result.length === 0) {
        logger.warn('No modality interactions found for modality', { modality }, 'AdminModalityInteractionsController');
        throw new NotFoundException(`No modality interactions found for modality: ${modality}`);
      }

      logger.info('Modality interactions retrieved successfully', { 
        modality,
        count: result.length
      }, 'AdminModalityInteractionsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get modality interactions by modality', {
        modality,
        error
      }, 'AdminModalityInteractionsController');
      
      throw error;
    }
  }

  /**
   * Finds modality interactions by dynamic, throws NotFoundException if not found (admin use)
   * @param dynamic - dynamic name
   * @returns Promise<ModalityInteraction[]> - Array of modality interaction objects
   * @throws NotFoundException when no modality interactions found for the dynamic
   */
  @Get('dynamics/:dynamic')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getModalityInteractionsByDynamic(@Param('dynamic') dynamic: string): Promise<ModalityInteraction[]> {
    logger.info('Admin fetching modality interactions by dynamic', { dynamic }, 'AdminModalityInteractionsController');
    
    try {
      const result = await this.service.findByDynamic(dynamic);
      
      if (!result || result.length === 0) {
        logger.warn('No modality interactions found for dynamic', { dynamic }, 'AdminModalityInteractionsController');
        throw new NotFoundException(`No modality interactions found for dynamic: ${dynamic}`);
      }

      logger.info('Modality interactions retrieved successfully', { 
        dynamic,
        count: result.length
      }, 'AdminModalityInteractionsController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get modality interactions by dynamic', {
        dynamic,
        error
      }, 'AdminModalityInteractionsController');
      
      throw error;
    }
  }
}