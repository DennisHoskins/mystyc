import { Controller } from '@nestjs/common';

import { Sign } from 'mystyc-common/schemas';

import { SignsService } from '@/astrology/signs.service';
import { AdminController } from './admin.controller';

@Controller('admin/signs')
export class AdminSignsController extends AdminController<Sign> {
  protected serviceName = 'Signs';
  
  constructor(protected service: SignsService) {
    super();
  }
}