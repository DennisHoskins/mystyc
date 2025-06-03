import { Controller, Get, Param, NotFoundException } from '@nestjs/common';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { NotificationsService } from '@/notifications/notifications.service';
import { logger } from '@/util/logger';

@Controller('admin/notification')
export class AdminNotificationController {

  constructor(
    private readonly notificationsService: NotificationsService
  ) {}

  @Get(':notificationId')
  @Roles(UserRole.ADMIN)
  async getNotification(@Param('notificationId') notificationId: string) {
    logger.info('Admin fetching notification by ID', { notificationId }, 'AdminNotificationController');
    
    const notification = await this.notificationsService.findNotificationById(notificationId);
    
    if (!notification) {
      logger.warn('Notification not found', { notificationId }, 'AdminNotificationController');
      throw new NotFoundException('Notification not found');
    }

    logger.info('Notification retrieved', { notificationId }, 'AdminNotificationController');
    return notification;
  }
}