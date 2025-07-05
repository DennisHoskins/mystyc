import { Controller, Query, Get, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { NotificationsService } from '@/notifications/notifications.service';
import { AdminNotificationsStatsService } from '@/admin/services/admin-notifications-stats.service';
import { Notification } from '@/common/interfaces/notification.interface';
import { 
  NotificationDeliveryStats,
  NotificationTypeStats,
  NotificationEngagementStats,
  NotificationPatternsStats
} from '@/common/interfaces/admin/adminNotificationStats.interface';
import { AdminController } from '../admin.controller';
import { NotificationStatsQueryDto } from '../../dto/stats/admin-notification-stats-query.dto';

@Controller('admin/notifications')
export class AdminNotificationsStatsController extends AdminController<Notification> {
  protected serviceName = 'Notifications';

  constructor(
    protected service: NotificationsService,
    private readonly adminNotificationsStatsService: AdminNotificationsStatsService,
  ) {
    super();
  }

  @Get('stats/delivery')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getNotificationDeliveryStats(@Query() query: NotificationStatsQueryDto): Promise<NotificationDeliveryStats> {
    return this.adminNotificationsStatsService.getDeliveryStats(query);
  }

  @Get('stats/type')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getNotificationTypeStats(@Query() query: NotificationStatsQueryDto): Promise<NotificationTypeStats> {
    return this.adminNotificationsStatsService.getTypeStats(query);
  }

  @Get('stats/engagement')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getNotificationEngagementStats(@Query() query: NotificationStatsQueryDto): Promise<NotificationEngagementStats> {
    return this.adminNotificationsStatsService.getEngagementStats(query);
  }

  @Get('stats/pattern')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getNotificationPatternStats(@Query() query: NotificationStatsQueryDto): Promise<NotificationPatternsStats> {
    return this.adminNotificationsStatsService.getPatternStats(query);
  }
}