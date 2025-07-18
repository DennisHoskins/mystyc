import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { AdminUsersStatsService } from '@/admin/services/admin-users-stats.service';
import { AdminDevicesStatsService } from '@/admin/services/admin-devices-stats.service';
import { AdminAuthEventsStatsService } from '@/admin/services/admin-auth-events-stats.service';
import { AdminNotificationsStatsService } from '@/admin/services/admin-notifications-stats.service';
import { OpenAICoreService } from '@/openai/openai-core.service';
import { AdminOpenAIStatsService } from '@/admin/services/admin-openai-stats.service';
import { AdminContentStatsService } from '@/admin/services/admin-content-stats.service';
import { AdminSchedulesStatsService } from '@/admin/services/admin-schedules-stats.service';
import { AdminScheduleExecutionsStatsService } from '@/admin/services/admin-schedule-executions-stats.service';
import { AdminSubscriptionsStatsService } from '@/admin/services/admin-subscriptions-stats.service';
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
    private readonly openAICoreService: OpenAICoreService,
    private readonly adminOpenAIStatsService: AdminOpenAIStatsService,
    private readonly adminContentStatsService: AdminContentStatsService,
    private readonly adminScheduleStatsService: AdminSchedulesStatsService,
    private readonly adminScheduleExecutionStatsService: AdminScheduleExecutionsStatsService,
    private readonly adminSubscriptionStatsService: AdminSubscriptionsStatsService,
  ) {}

  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminSummaryStats(@Query() query: AdminStatsQueryDto): Promise<AdminStatsResponse> {
    logger.info('Generating comprehensive admin stats', { query }, 'AdminStatsController');

    // Single Promise.all for all stats
    const [
      // Users
      registrations, profiles, userActivity,
      // Devices  
      platforms, fcmTokens, deviceActivity, userAgents,
      // Auth Events
      authSummary, duration, authEventsPattern, distribution,
      // Notifications
      delivery, notificationType, engagement, notificationPattern,
      // Content
      contentSummary, sources, generation, timeline,
      // Schedule
      scheduleSummary, performance, failures, executions,
      // OpenAI
      currentMonthlyUsage, openaiSummary, monthlyUsage, contentTypeUsage,
      // Subscriptions
      subscriptionsSummary
    ] = await Promise.all([
      // Users
      this.adminUsersStatsService.getRegistrationStats(query),
      this.adminUsersStatsService.getProfileCompletionStats(query),
      this.adminUsersStatsService.getActivityStats(query),
      
      // Devices
      this.adminDevicesStatsService.getPlatformStats(query),
      this.adminDevicesStatsService.getFcmTokenStats(query),
      this.adminDevicesStatsService.getDeviceActivityStats(query),
      this.adminDevicesStatsService.getUserAgentStats(query),
      
      // Auth Events
      this.adminAuthEventsStatsService.getSummaryStats(query),
      this.adminAuthEventsStatsService.getSessionDurationStats(query),
      this.adminAuthEventsStatsService.getPatternStats(query),
      this.adminAuthEventsStatsService.getGeographicStats(query),
      
      // Notifications
      this.adminNotificationsStatsService.getDeliveryStats(query),
      this.adminNotificationsStatsService.getTypeStats(query),
      this.adminNotificationsStatsService.getEngagementStats(query),
      this.adminNotificationsStatsService.getPatternStats(query),
      
      // Content
      this.adminContentStatsService.getSummaryStats(query),
      this.adminContentStatsService.getSourceStats(query),
      this.adminContentStatsService.getGenerationStats(query),
      this.adminContentStatsService.getTimelineStats(query),
      
      // Schedule
      this.adminScheduleStatsService.getSummaryStats(query),
      this.adminScheduleStatsService.getPerformanceStats(query),
      this.adminScheduleStatsService.getFailureStats(query),
      this.adminScheduleExecutionStatsService.getOverallScheduleStats(query),
      
      // OpenAI
      this.openAICoreService.getUsageStats(),
      this.adminOpenAIStatsService.getSummaryStats(query),
      this.adminOpenAIStatsService.getMonthlyUsageStats(query),
      this.adminOpenAIStatsService.getContentTypeUsageStats(query),

      // Subscriptions
      this.adminSubscriptionStatsService.getSummaryStats(),
    ]);

    return {
      users: { registrations, profiles, activity: userActivity },
      devices: { platforms, fcmTokens, activity: deviceActivity, userAgents },
      authEvents: { summary: authSummary, duration, pattern: authEventsPattern, distribution },
      notifications: { delivery, type: notificationType, engagement, pattern: notificationPattern },
      content: { summary: contentSummary, sources, generation, timeline },
      schedule: { summary: scheduleSummary, performance, failures, executions },
      openai: { currentMonthlyUsage, usageSummary: openaiSummary, monthlyUsage, contentTypeUsage },
      subscriptions: { summary: subscriptionsSummary }
    };
  }
}