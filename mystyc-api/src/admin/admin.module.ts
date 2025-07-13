import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { 
  AdminUsersController,
  AdminDevicesController,
  AdminAuthEventsController,
  AdminOpenAIController,
  AdminContentController,
  AdminScheduleController,
  AdminScheduleExecutionController,
  AdminNotificationsController,
  AdminNotificationsSendController,
  AdminStatsController,
  AdminUsersStatsController,
  AdminDevicesStatsController,
  AdminAuthEventsStatsController,
  AdminNotificationsStatsController,
  AdminScheduleStatsController,
  AdminScheduleExecutionStatsController,
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
import { AdminScheduleStatsService } from './services/admin-schedule-stats.service';
import { AdminScheduleExecutionStatsService } from './services/admin-schedule-execution-stats.service';

import { UserProfileSchema } from '@/users/schemas/userProfile.schema';
import { DeviceSchema } from '@/devices/schemas/device.schema';
import { AuthEventSchema } from '@/auth-events/schemas/auth-event.schema';
import { NotificationSchema } from '@/notifications/schemas/notification.schema';
import { ContentSchema } from '@/content/schemas/content.schema';
import { OpenAIRequestSchema } from '@/openai/schemas/openai-request.schema';
import { ScheduleSchema } from '@/schedule/schemas/schedule.schema';
import { ScheduleExecutionSchema } from '@/schedule/schemas/schedule-execution.schema';

@Module({
  imports: [
    AppServicesModule,
    MongooseModule.forFeature([
      { name: 'UserProfile', schema: UserProfileSchema },
      { name: 'Device', schema: DeviceSchema },
      { name: 'AuthEvent', schema: AuthEventSchema },
      { name: 'Notification', schema: NotificationSchema },
      { name: 'OpenAIRequest', schema: OpenAIRequestSchema },
      { name: 'Content', schema: ContentSchema },
      { name: 'Schedule', schema: ScheduleSchema },
      { name: 'ScheduleExecution', schema: ScheduleExecutionSchema },
    ])
  ],
controllers: [
    AdminUsersController,
    AdminDevicesController,
    AdminAuthEventsController,
    AdminContentController,
    AdminOpenAIController,
    AdminScheduleController,
    AdminScheduleExecutionController,
    AdminNotificationsController,
    AdminNotificationsSendController,
    AdminStatsController,
    AdminUsersStatsController,
    AdminDevicesStatsController,
    AdminAuthEventsStatsController,
    AdminNotificationsStatsController,
    AdminScheduleStatsController,
    AdminScheduleExecutionStatsController,
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
    AdminScheduleStatsService,
    AdminScheduleExecutionStatsService,
  ]
})
export class AdminModule {}