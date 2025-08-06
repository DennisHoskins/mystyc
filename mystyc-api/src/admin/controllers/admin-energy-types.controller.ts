import { Controller } from '@nestjs/common';

import { EnergyType } from 'mystyc-common/schemas';

import { EnergyTypesService } from '@/astrology/energy-types.service';
import { AdminController } from './admin.controller';

@Controller('admin/energy-types')
export class AdminEnergyTypesController extends AdminController<EnergyType> {
  protected serviceName = 'EnergyTypes';
  
  constructor(protected service: EnergyTypesService) {
    super();
  }
}