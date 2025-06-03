import { Controller, Get, Post, Body, Param, Query, NotFoundException, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { FirebaseUser } from '@/common/interfaces/firebaseUser.interface';
import { FirebaseUser as FirebaseUserDecorator } from '@/common/decorators/user.decorator';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { DeviceService } from '@/devices/device.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { SendNotificationDto } from '@/notifications/dto/send-notification.dto';
import { logger } from '@/util/logger';

@Controller('admin/notifications')
export class AdminNotificationsController {

  constructor(
    private readonly deviceService: DeviceService,
    private readonly notificationsService: NotificationsService
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllNotifications(@Query() query: any) {
    logger.info('Admin fetching notifications', { query }, 'AdminNotificationsController');
    
    const filters: any = {};
    
    if (query.firebaseUid) filters.firebaseUid = query.firebaseUid;
    if (query.deviceId) filters.deviceId = query.deviceId;
    if (query.type) filters.type = query.type;
    if (query.status) filters.status = query.status;
    if (query.sentBy) filters.sentBy = query.sentBy;
    
    const notifications = await this.notificationsService.findNotifications(
      filters,
      query.limit || 50,
      query.offset || 0
    );
    
    logger.info('Admin notifications retrieved', { 
      count: notifications.length,
      filters
    }, 'AdminNotificationsController');
    
    return notifications;
  }
}