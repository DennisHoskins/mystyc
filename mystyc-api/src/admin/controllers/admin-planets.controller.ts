import { Controller } from '@nestjs/common';

import { Planet } from 'mystyc-common/schemas';

import { PlanetsService } from '@/astrology/planets.service';
import { AdminController } from './admin.controller';

@Controller('admin/planets')
export class AdminPlanetsController extends AdminController<Planet> {
  protected serviceName = 'Planets';
  
  constructor(protected service: PlanetsService) {
    super();
  }
}