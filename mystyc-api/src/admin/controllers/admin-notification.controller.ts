import { Controller } from '@nestjs/common';

import { NotificationsService } from '@/notifications/notifications.service';
import { Notification } from '@/common/interfaces/notification.interface';
import { AdminController } from './admin.controller';

@Controller('admin/notification')
export class AdminNotificationController extends AdminController<Notification> {
  protected serviceName = 'Notification';
  
  constructor(protected service: NotificationsService) {
    super();
  }
}