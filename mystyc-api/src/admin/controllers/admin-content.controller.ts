import { Controller } from '@nestjs/common';

import { ContentService } from '@/content/content.service';
import { Content } from '@/common/interfaces/content.interface';
import { AdminController } from './admin.controller';

@Controller('admin/content')
export class AdminContentController extends AdminController<Content> {
  protected serviceName = 'Content';
  
  constructor(protected service: ContentService) {
    super();
  }
}