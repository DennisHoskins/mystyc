import { Controller } from '@nestjs/common';

import { Dynamic } from 'mystyc-common/schemas';

import { DynamicsService } from '@/astrology/dynamics.service';
import { AdminController } from './admin.controller';

@Controller('admin/dynamics')
export class AdminDynamicsController extends AdminController<Dynamic> {
  protected serviceName = 'Dynamics';
  
  constructor(protected service: DynamicsService) {
    super();
  }
}