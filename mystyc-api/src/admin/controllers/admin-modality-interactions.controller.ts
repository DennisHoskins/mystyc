import { Controller } from '@nestjs/common';

import { ModalityInteraction } from 'mystyc-common/schemas';

import { ModalityInteractionsService } from '@/astrology/modality-interactions.service';
import { AdminController } from './admin.controller';

@Controller('admin/modality-interactions')
export class AdminModalityInteractionsController extends AdminController<ModalityInteraction> {
  protected serviceName = 'ModalityInteractions';
  
  constructor(protected service: ModalityInteractionsService) {
    super();
  }
}