import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { 
  AdminUsersController,
  AdminDevicesController,
  AdminAuthEventsController,
  AdminOpenAIController,
  AdminContentController,
  AdminWebsiteContentController,
  AdminNotificationsContentController,
  AdminUsersContentController,
  AdminUsersPlusContentController,
  AdminPaymentsController,
  AdminSchedulesController,
  AdminScheduleExecutionsController,
  AdminNotificationsController,
  
  AdminStatsController,
  AdminUsersStatsController,
  AdminDevicesStatsController,
  AdminAuthEventsStatsController,
  AdminNotificationsStatsController,
  AdminSchedulesStatsController,
  AdminScheduleExecutionsStatsController,
  AdminContentStatsController,
  AdminOpenAIStatsController,
  AdminSubscriptionsStatsController
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
import { PaymentHistorySchema } from '@/payments/schemas/payment-history.schema';
import { AdminSubscriptionsStatsService } from './services/admin-subscriptions-stats.service';

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
      { name: 'PaymentHistory', schema: PaymentHistorySchema },
    ])
  ],
controllers: [
    AdminUsersController,
    AdminDevicesController,
    AdminAuthEventsController,
    AdminContentController,
    AdminWebsiteContentController,
    AdminNotificationsContentController,
    AdminUsersContentController,
    AdminUsersPlusContentController,
    AdminPaymentsController,
    AdminOpenAIController,
    AdminSchedulesController,
    AdminScheduleExecutionsController,
    AdminNotificationsController,
    
    AdminStatsController,
    AdminUsersStatsController,
    AdminDevicesStatsController,
    AdminAuthEventsStatsController,
    AdminNotificationsStatsController,
    AdminSchedulesStatsController,
    AdminScheduleExecutionsStatsController,
    AdminContentStatsController,
    AdminOpenAIStatsController,
    AdminSubscriptionsStatsController
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
    AdminSubscriptionsStatsService
  ]
})
export class AdminModule {}