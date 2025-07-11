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
  NotificationPatternsStats,
  NotificationStats
} from '@/common/interfaces/admin/stats/admin-notification-stats.interface';
import { AdminController } from '../admin.controller';
import { AdminStatsQueryDto } from '@/admin/dto/admin-stats-query.dto'; 

@Controller('admin/stats/notifications')
export class AdminNotificationsStatsController extends AdminController<Notification> {
  protected serviceName = 'Notifications';

  constructor(
    protected service: NotificationsService,
    private readonly adminNotificationsStatsService: AdminNotificationsStatsService,
  ) {
    super();
  }

  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats(@Query() query: AdminStatsQueryDto): Promise<NotificationStats> {
    const [delivery, notificationType, engagement, pattern] = await Promise.all([
      this.adminNotificationsStatsService.getDeliveryStats(query),
      this.adminNotificationsStatsService.getTypeStats(query),
      this.adminNotificationsStatsService.getEngagementStats(query),
      this.adminNotificationsStatsService.getPatternStats(query),
    ]);
    return {
      delivery,
      type: notificationType,
      engagement,
      pattern
    }
  }

  @Get('stats/delivery')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDeliveryStats(@Query() query: AdminStatsQueryDto): Promise<NotificationDeliveryStats> {
    return this.adminNotificationsStatsService.getDeliveryStats(query);
  }

  @Get('stats/type')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getTypeStats(@Query() query: AdminStatsQueryDto): Promise<NotificationTypeStats> {
    return this.adminNotificationsStatsService.getTypeStats(query);
  }

  @Get('stats/engagement')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getEngagementStats(@Query() query: AdminStatsQueryDto): Promise<NotificationEngagementStats> {
    return this.adminNotificationsStatsService.getEngagementStats(query);
  }

  @Get('stats/pattern')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPatternStats(@Query() query: AdminStatsQueryDto): Promise<NotificationPatternsStats> {
    return this.adminNotificationsStatsService.getPatternStats(query);
  }
}