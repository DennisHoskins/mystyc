import { Controller } from '@nestjs/common';

import { NotificationsService } from '@/notifications/notifications.service';
import { Notification } from 'mystyc-common/schemas';
import { AdminController } from './admin.controller';

@Controller('admin/notifications')
export class AdminNotificationsController extends AdminController<Notification> {
  protected serviceName = 'Notifications';
  
  constructor(protected service: NotificationsService) {
    super();
  }
}