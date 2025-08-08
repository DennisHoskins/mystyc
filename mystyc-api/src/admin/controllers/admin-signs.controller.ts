import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from 'mystyc-common/constants';
import { logger } from '@/common/util/logger';

import { Sign } from 'mystyc-common/schemas';

import { SignsService } from '@/astrology/signs.service';
import { AdminController } from './admin.controller';

function isErrorWithStatus(e: unknown): e is { status: number } {
  return (
    typeof e === 'object' &&
    e !== null &&
    'status' in e &&
    typeof (e as any).status === 'number'
  );
}  

@Controller('admin/signs')
export class AdminSignsController extends AdminController<Sign> {
  protected serviceName = 'Signs';
  
  constructor(protected service: SignsService) {
    super();
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