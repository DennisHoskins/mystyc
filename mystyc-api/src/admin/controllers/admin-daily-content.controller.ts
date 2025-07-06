import { Controller } from '@nestjs/common';

import { DailyContentService } from '@/daily-content/daily-content.service';
import { DailyContent } from '@/common/interfaces/dailyContent.interface';
import { AdminController } from './admin.controller';

@Controller('admin/daily-content')
export class AdminDailyContentController extends AdminController<DailyContent> {
  protected serviceName = 'DailyContent';
  
  constructor(protected service: DailyContentService) {
    super();
  }
}