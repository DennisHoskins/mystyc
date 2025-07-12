import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { AdminUsersStatsService } from '@/admin/services/admin-users-stats.service';
import { AdminDevicesStatsService } from '@/admin/services/admin-devices-stats.service';
import { AdminAuthEventsStatsService } from '@/admin/services/admin-auth-events-stats.service';
import { AdminNotificationsStatsService } from '@/admin/services/admin-notifications-stats.service';
import { AdminOpenAIStatsService } from '@/admin/services/admin-openai-stats.service';
import { AdminContentStatsService } from '@/admin/services/admin-content-stats.service';
import { AdminScheduleStatsService } from '@/admin/services/admin-schedule-stats.service';
import { AdminScheduleExecutionStatsService } from '@/admin/services/admin-schedule-execution-stats.service';
import { AdminStatsQueryDto } from '@/admin/dto/admin-stats-query.dto'; 
import { AdminStatsResponse } from '@/common/interfaces/admin/stats/admin-stats-response.interface';
import { logger } from '@/common/util/logger';

@Controller('admin/stats')
export class AdminStatsController {
  constructor(
    private readonly adminUsersStatsService: AdminUsersStatsService,
    private readonly adminDevicesStatsService: AdminDevicesStatsService,
    private readonly adminAuthEventsStatsService: AdminAuthEventsStatsService,
    private readonly adminNotificationsStatsService: AdminNotificationsStatsService,
    private readonly adminOpenAIStatsService: AdminOpenAIStatsService,
    private readonly adminContentStatsService: AdminContentStatsService,
    private readonly adminScheduleStatsService: AdminScheduleStatsService,
    private readonly adminScheduleExecutionStatsService: AdminScheduleExecutionStatsService,
  ) {}

  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminSummaryStats(@Query() query: AdminStatsQueryDto): Promise<AdminStatsResponse> {

   logger.info('', {}, 'AdminStatsService');
   logger.info('Generating stats', { query }, 'AdminStatsService');
   logger.info('', {}, 'AdminStatsService');

    const [registrations, profiles, userActivity] = await Promise.all([
      this.adminUsersStatsService.getRegistrationStats(query),
      this.adminUsersStatsService.getProfileCompletionStats(query),
      this.adminUsersStatsService.getActivityStats(query),
    ]);

    const [platforms, fcmTokens, deviceActivity, userAgents] = await Promise.all([
      this.adminDevicesStatsService.getPlatformStats(query),
      this.adminDevicesStatsService.getFcmTokenStats(query),
      this.adminDevicesStatsService.getDeviceActivityStats(query),
      this.adminDevicesStatsService.getUserAgentStats(query),
    ]);

    const [authSummary, duration, authEventsPattern, distribution] = await Promise.all([
      this.adminAuthEventsStatsService.getSummaryStats(query),
      this.adminAuthEventsStatsService.getSessionDurationStats(query),
      this.adminAuthEventsStatsService.getPatternStats(query),
      this.adminAuthEventsStatsService.getGeographicStats(query)
    ]);

    const [delivery, notificationType, engagement, notificaitionPattern] = await Promise.all([
      this.adminNotificationsStatsService.getDeliveryStats(query),
      this.adminNotificationsStatsService.getTypeStats(query),
      this.adminNotificationsStatsService.getEngagementStats(query),
      this.adminNotificationsStatsService.getPatternStats(query),
    ]);

    const [contentSummary, sources, generation, timeline] = await Promise.all([
      this.adminContentStatsService.getSummaryStats(query),
      this.adminContentStatsService.getSourceStats(query),
      this.adminContentStatsService.getGenerationStats(query),
      this.adminContentStatsService.getTimelineStats(query),
    ]);

    const [scheduleSummary, performance, failures, executions] = await Promise.all([
      this.adminScheduleStatsService.getSummaryStats(query),
      this.adminScheduleStatsService.getPerformanceStats(query),
      this.adminScheduleStatsService.getFailureStats(query),
      this.adminScheduleExecutionStatsService.getOverallScheduleStats(query),
    ]);

    const [openaiSummary] = await Promise.all([
      this.adminOpenAIStatsService.getSummaryStats(query),
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
        failures,
        executions
      },
      content: {
        summary: contentSummary,
        sources,
        generation,
        timeline
      },
      openai: {
        summary: openaiSummary
      }
    };
  }
}