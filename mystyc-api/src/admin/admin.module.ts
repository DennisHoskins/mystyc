import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { 
  AdminUsersController,
  AdminUsersPlusController,
  AdminDevicesController,
  AdminAuthEventsController,
  AdminOpenAIController,
  AdminContentController,
  AdminWebsiteContentController,
  AdminNotificationsContentController,
  AdminUsersContentController,
  AdminUsersPlusContentController,
  AdminSchedulesController,
  AdminScheduleExecutionsController,
  AdminNotificationsController,
  AdminNotificationsSendController,
  
  AdminStatsController,
  AdminUsersStatsController,
  AdminDevicesStatsController,
  AdminAuthEventsStatsController,
  AdminNotificationsStatsController,
  AdminSchedulesStatsController,
  AdminScheduleExecutionsStatsController,
  AdminContentStatsController,
  AdminOpenAIStatsController,
} from './controllers';

import { AppServicesModule } from '../app-services.module';
import { AdminUsersStatsService } from './services/admin-users-stats.service';
import { AdminDevicesStatsService } from './services/admin-devices-stats.service';
import { AdminAuthEventsStatsService } from './services/admin-auth-events-stats.service';
import { AdminNotificationsStatsService } from './services/admin-notifications-stats.service';
import { AdminContentStatsService } from './services/admin-content-stats.service';
import { AdminOpenAIStatsService } from './services/admin-openai-stats.service';
import { AdminSchedulesStatsService } from './services/admin-schedules-stats.service';
import { AdminScheduleExecutionsStatsService } from './services/admin-schedule-executions-stats.service';

import { UserProfileSchema } from '@/users/schemas/user-profile.schema';
import { DeviceSchema } from '@/devices/schemas/device.schema';
import { AuthEventSchema } from '@/auth-events/schemas/auth-event.schema';
import { NotificationSchema } from '@/notifications/schemas/notification.schema';
import { ContentSchema } from '@/content/schemas/content.schema';
import { OpenAIUsageSchema } from '@/openai/schemas/openai-usage.schema';
import { ScheduleSchema } from '@/schedules/schemas/schedule.schema';
import { ScheduleExecutionSchema } from '@/schedules/schemas/schedule-execution.schema';

@Module({
  imports: [
    AppServicesModule,
    MongooseModule.forFeature([
      { name: 'UserProfile', schema: UserProfileSchema },
      { name: 'Device', schema: DeviceSchema },
      { name: 'AuthEvent', schema: AuthEventSchema },
      { name: 'Notification', schema: NotificationSchema },
      { name: 'OpenAIUsage', schema: OpenAIUsageSchema },
      { name: 'Content', schema: ContentSchema },
      { name: 'Schedule', schema: ScheduleSchema },
      { name: 'ScheduleExecution', schema: ScheduleExecutionSchema },
    ])
  ],
controllers: [
    AdminUsersController,
    AdminUsersPlusController,
    AdminDevicesController,
    AdminAuthEventsController,
    AdminContentController,
    AdminWebsiteContentController,
    AdminNotificationsContentController,
    AdminUsersContentController,
    AdminUsersPlusContentController,
    AdminOpenAIController,
    AdminSchedulesController,
    AdminScheduleExecutionsController,
    AdminNotificationsController,
    AdminNotificationsSendController,
    AdminStatsController,
    AdminUsersStatsController,
    AdminDevicesStatsController,
    AdminAuthEventsStatsController,
    AdminNotificationsStatsController,
    AdminSchedulesStatsController,
    AdminScheduleExecutionsStatsController,
    AdminContentStatsController,
    AdminOpenAIStatsController,
  ],
  providers: [
    AdminUsersStatsService,
    AdminDevicesStatsService,
    AdminAuthEventsStatsService,
    AdminNotificationsStatsService,
    AdminOpenAIStatsService,
    AdminContentStatsService,
    AdminSchedulesStatsService,
    AdminScheduleExecutionsStatsService,
  ]
})
export class AdminModule {}