import { Controller } from '@nestjs/common';

import { Element } from 'mystyc-common/schemas';

import { ElementsService } from '@/astrology/elements.service';
import { AdminController } from './admin.controller';

@Controller('admin/elements')
export class AdminElementsController extends AdminController<Element> {
  protected serviceName = 'Elements';
  
  constructor(protected service: ElementsService) {
    super();
  }
}