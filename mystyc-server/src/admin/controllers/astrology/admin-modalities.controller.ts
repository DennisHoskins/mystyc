import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from 'mystyc-common/constants';
import { logger } from '@/common/util/logger';
import { isErrorWithStatus } from '@/common/util/error';

import { Modality } from 'mystyc-common/schemas';

import { ModalitiesService } from '@/astrology/services/modalities.service';
import { AdminController } from '../admin.controller';

@Controller('admin/modalities')
export class AdminModalitiesController extends AdminController<Modality> {
  protected serviceName = 'Modalities';
  
  constructor(protected service: ModalitiesService) {
    super();
  }

  /**
   * Finds modality by name, throws NotFoundException if not found (admin use)
   * @param modality - Modality name
   * @returns Promise<Modality> - Modality object
   * @throws NotFoundException when modality not found
   */
  @Get(':modality')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getModality(@Param('modality') modality: string) {
    logger.info('Admin fetching modality by name', { modality }, 'AdminModalitiesController');
    
    try {
      const result = await this.service.findByName(modality);
      
      if (!result) {
        logger.warn('Modality not found', { modality }, 'AdminModalitiesController');
        throw new NotFoundException('Modality not found');
      }

      logger.info('Modality retrieved successfully', { 
        modality, 
      }, 'AdminModalitiesController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get modality', {
        modality,
        error
      }, 'AdminModalitiesController');
      
      throw error;
    }
  }
}