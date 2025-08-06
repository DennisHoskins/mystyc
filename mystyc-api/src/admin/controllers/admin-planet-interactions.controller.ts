import { Controller } from '@nestjs/common';

import { PlanetInteraction } from 'mystyc-common/schemas';

import { PlanetInteractionsService } from '@/astrology/planet-interactions.service';
import { AdminController } from './admin.controller';

@Controller('admin/planet-interactions')
export class AdminPlanetInteractionsController extends AdminController<PlanetInteraction> {
  protected serviceName = 'PlanetInteractions';
  
  constructor(protected service: PlanetInteractionsService) {
    super();
  }
}