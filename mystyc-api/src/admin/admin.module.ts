import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { 
  AdminUsersController,
  AdminDevicesController,
  AdminAuthEventsController,
  AdminContentController,
  AdminScheduleController,
  AdminNotificationsController,
  AdminNotificationsSendController,
  AdminStatsController,
  AdminUsersStatsController,
  AdminDevicesStatsController,
  AdminAuthEventsStatsController,
  AdminNotificationsStatsController,
  AdminScheduleStatsController,
  AdminContentStatsController,
} from './controllers';
import { UsersModule } from '@/users/users.module';
import { DevicesModule } from '@/devices/devices.module';
import { AuthEventsModule } from '@/auth-events/auth-events.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { ContentModule } from '@/content/content.module';
import { ScheduleModule } from '@/schedule/schedule.module';
import { AdminUsersStatsService } from './services/admin-users-stats.service';
import { AdminDevicesStatsService } from './services/admin-devices-stats.service';
import { AdminAuthEventsStatsService } from './services/admin-auth-events-stats.service';
import { AdminNotificationsStatsService } from './services/admin-notifications-stats.service';
import { AdminContentStatsService } from './services/admin-content-stats.service';
import { AdminScheduleStatsService } from './services/admin-schedule-stats.service';
import { FirebaseModule } from '@/auth/firebase.module';

import { UserProfileSchema } from '@/users/schemas/userProfile.schema';
import { DeviceSchema } from '@/devices/schemas/device.schema';
import { AuthEventSchema } from '@/auth-events/schemas/auth-event.schema';
import { NotificationSchema } from '@/notifications/schemas/notification.schema';
import { ContentSchema } from '@/content/schemas/content.schema';
import { ScheduleSchema } from '@/schedule/schemas/schedule.schema';

@Module({
  imports: [
    UsersModule, 
    DevicesModule, 
    AuthEventsModule, 
    NotificationsModule, 
    ContentModule, 
    ScheduleModule, 
    FirebaseModule,
    MongooseModule.forFeature([
      { name: 'UserProfile', schema: UserProfileSchema },
      { name: 'Device', schema: DeviceSchema },
      { name: 'AuthEvent', schema: AuthEventSchema },
      { name: 'Notification', schema: NotificationSchema },
      { name: 'Content', schema: ContentSchema },
      { name: 'Schedule', schema: ScheduleSchema },
    ])
  ],
  controllers: [
    AdminUsersController,
    AdminDevicesController,
    AdminAuthEventsController,
    AdminContentController,
    AdminScheduleController,
    AdminNotificationsController,
    AdminNotificationsSendController,
    AdminStatsController,
    AdminUsersStatsController,
    AdminDevicesStatsController,
    AdminAuthEventsStatsController,
    AdminNotificationsStatsController,
    AdminScheduleStatsController,
    AdminContentStatsController,
  ],
  providers: [
    AdminUsersStatsService,
    AdminDevicesStatsService,
    AdminAuthEventsStatsService,
    AdminNotificationsStatsService,
    AdminContentStatsService,
    AdminScheduleStatsService,
  ]
})
export class AdminModule {}