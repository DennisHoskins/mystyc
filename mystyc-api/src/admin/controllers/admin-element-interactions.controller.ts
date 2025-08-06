import { Controller } from '@nestjs/common';

import { ElementInteraction } from 'mystyc-common/schemas';

import { ElementInteractionsService } from '@/astrology/element-interactions.service';
import { AdminController } from './admin.controller';

@Controller('admin/element-interactions')
export class AdminElementInteractionsController extends AdminController<ElementInteraction> {
  protected serviceName = 'ElementInteractions';
  
  constructor(protected service: ElementInteractionsService) {
    super();
  }
}