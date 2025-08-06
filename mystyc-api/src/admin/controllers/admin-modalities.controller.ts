import { Controller } from '@nestjs/common';

import { Modality } from 'mystyc-common/schemas';

import { ModalitiesService } from '@/astrology/modalities.service';
import { AdminController } from './admin.controller';

@Controller('admin/modalities')
export class AdminModalitiesController extends AdminController<Modality> {
  protected serviceName = 'Modalities';
  
  constructor(protected service: ModalitiesService) {
    super();
  }
}