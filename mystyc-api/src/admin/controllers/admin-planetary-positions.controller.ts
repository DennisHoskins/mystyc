import { Controller } from '@nestjs/common';

import { PlanetaryPosition } from 'mystyc-common/schemas';

import { PlanetaryPositionsService } from '@/astrology/planetary-positions.service';
import { AdminController } from './admin.controller';

@Controller('admin/planetary-positions')
export class AdminPlanetaryPositionsController extends AdminController<PlanetaryPosition> {
  protected serviceName = 'PlanetaryPositions';
  
  constructor(protected service: PlanetaryPositionsService) {
    super();
  }
}