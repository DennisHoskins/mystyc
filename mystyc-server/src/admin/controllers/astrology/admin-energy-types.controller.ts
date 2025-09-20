import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from 'mystyc-common/constants';
import { logger } from '@/common/util/logger';
import { isErrorWithStatus } from '@/common/util/error';

import { EnergyType } from 'mystyc-common/schemas';

import { EnergyTypesService } from '@/astrology/services/energy-types.service';
import { AdminController } from '../admin.controller';

@Controller('admin/energy-types')
export class AdminEnergyTypesController extends AdminController<EnergyType> {
  protected serviceName = 'EnergyTypes';
  
  constructor(protected service: EnergyTypesService) {
    super();
  }

  /**
   * Finds energyType by name, throws NotFoundException if not found (admin use)
   * @param energyType - EnergyType name
   * @returns Promise<EnergyType> - EnergyType object
   * @throws NotFoundException when energyType not found
   */
  @Get(':energyType')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getEnergyType(@Param('energyType') energyType: string) {
    logger.info('Admin fetching energyType by name', { energyType }, 'AdminEnergyTypesController');
    
    try {
      const result = await this.service.findByName(energyType);
      
      if (!result) {
        logger.warn('EnergyType not found', { energyType }, 'AdminEnergyTypesController');
        throw new NotFoundException('EnergyType not found');
      }

      logger.info('EnergyType retrieved successfully', { 
        energyType, 
      }, 'AdminEnergyTypesController');
      
      return result;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get energyType', {
        energyType,
        error
      }, 'AdminEnergyTypesController');
      
      throw error;
    }
  }
}