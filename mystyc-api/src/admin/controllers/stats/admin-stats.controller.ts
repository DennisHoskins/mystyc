import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { AdminUsersStatsService } from '@/admin/services/admin-users-stats.service';
import { AdminDevicesStatsService } from '@/admin/services/admin-devices-stats.service';
import { AdminAuthEventsStatsService } from '@/admin/services/admin-auth-events-stats.service';
import { AdminNotificationsStatsService } from '@/admin/services/admin-notifications-stats.service';
import { AdminContentStatsService } from '@/admin/services/admin-content-stats.service';
import { AdminScheduleStatsService } from '@/admin/services/admin-schedule-stats.service';
import { AdminStatsQueryDto } from '@/admin/dto/stats/admin-stats-query.dto'; 
import { AdminStatsResponse } from '@/common/interfaces/admin/adminStats.interface';

@Controller('admin/stats')
export class AdminStatsController {
  constructor(
    private readonly adminUsersStatsService: AdminUsersStatsService,
    private readonly adminDevicesStatsService: AdminDevicesStatsService,
    private readonly adminAuthEventsStatsService: AdminAuthEventsStatsService,
    private readonly adminNotificationsStatsService: AdminNotificationsStatsService,
    private readonly adminContentStatsService: AdminContentStatsService,
    private readonly adminScheduleStatsService: AdminScheduleStatsService,
  ) {}

  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminSummaryStats(@Query() query: AdminStatsQueryDto): Promise<AdminStatsResponse> {
    const [registrations, profiles, userActivity] = await Promise.all([
      this.adminUsersStatsService.getRegistrationStats(query.user),
      this.adminUsersStatsService.getProfileCompletionStats(query.user),
      this.adminUsersStatsService.getActivityStats(query.user),
    ]);

    const [platforms, fcmTokens, deviceActivity, userAgents] = await Promise.all([
      this.adminDevicesStatsService.getPlatformStats(query.device),
      this.adminDevicesStatsService.getFcmTokenStats(query.device),
      this.adminDevicesStatsService.getDeviceActivityStats(query.device),
      this.adminDevicesStatsService.getUserAgentStats(query.device),
    ]);

    const [authSummary, duration, authEventsPattern, distribution] = await Promise.all([
      this.adminAuthEventsStatsService.getSummaryStats(query.authEvent),
      this.adminAuthEventsStatsService.getSessionDurationStats(query.authEvent),
      this.adminAuthEventsStatsService.getPatternStats(query.authEvent),
      this.adminAuthEventsStatsService.getGeographicStats(query.authEvent)
    ]);

    const [delivery, notificationType, engagement, notificaitionPattern] = await Promise.all([
      this.adminNotificationsStatsService.getDeliveryStats(query.notification),
      this.adminNotificationsStatsService.getTypeStats(query.notification),
      this.adminNotificationsStatsService.getEngagementStats(query.notification),
      this.adminNotificationsStatsService.getPatternStats(query.notification),
    ]);

    const [contentSummary, sources, generation, timeline] = await Promise.all([
      this.adminContentStatsService.getSummaryStats(query.content),
      this.adminContentStatsService.getSourceStats(query.content),
      this.adminContentStatsService.getGenerationStats(query.content),
      this.adminContentStatsService.getTimelineStats(query.content),
    ]);

    const [scheduleSummary, performance, failures] = await Promise.all([
      this.adminScheduleStatsService.getSummaryStats(query.schedule),
      this.adminScheduleStatsService.getPerformanceStats(query.schedule),
      this.adminScheduleStatsService.getFailureStats(query.schedule),
    ]);

    return {
      users: {
        registrations,
        profiles,
        activity: userActivity
      },
      devices: {
        platforms,
        fcmTokens,
        activity: deviceActivity,
        userAgents
      },
      authEvents: {
        summary: authSummary,
        duration,
        pattern: authEventsPattern,
        distribution
      },
      notifications: {
        delivery,
        type: notificationType,
        engagement,
        pattern: notificaitionPattern
      },
      schedule: {
        summary: scheduleSummary,
        performance,
        failures
      },
      content: {
        summary: contentSummary,
        sources,
        generation,
        timeline
      }
    };
  }
}