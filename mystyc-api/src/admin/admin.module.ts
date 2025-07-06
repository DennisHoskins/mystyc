import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { 
  AdminUsersController,
  AdminDevicesController,
  AdminAuthEventsController,
  AdminDailyContentController,
  AdminNotificationsController,
  AdminNotificationsSendController,
  AdminStatsController,
  AdminUsersStatsController,
  AdminDevicesStatsController,
  AdminAuthEventsStatsController,
  AdminNotificationsStatsController,
  AdminDailyContentStatsController,
} from './controllers';
import { UsersModule } from '@/users/users.module';
import { DevicesModule } from '@/devices/devices.module';
import { AuthEventsModule } from '@/auth-events/auth-events.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { DailyContentModule } from '@/daily-content/daily-content.module';
import { AdminUsersStatsService } from './services/admin-users-stats.service';
import { AdminDevicesStatsService } from './services/admin-devices-stats.service';
import { AdminAuthEventsStatsService } from './services/admin-auth-events-stats.service';
import { AdminNotificationsStatsService } from './services/admin-notifications-stats.service';
import { AdminDailyContentStatsService } from './services/admin-daily-content-stats.service';
import { FirebaseModule } from '@/auth/firebase.module';

import { UserProfileSchema } from '@/users/schemas/userProfile.schema';
import { DeviceSchema } from '@/devices/schemas/device.schema';
import { AuthEventSchema } from '@/auth-events/schemas/auth-event.schema';
import { NotificationSchema } from '@/notifications/schemas/notification.schema';
import { DailyContentSchema } from '@/daily-content/schemas/daily-content.schema';

@Module({
  imports: [
    UsersModule, 
    DevicesModule, 
    AuthEventsModule, 
    NotificationsModule, 
    DailyContentModule, 
    FirebaseModule,
    MongooseModule.forFeature([
      { name: 'UserProfile', schema: UserProfileSchema },
      { name: 'Device', schema: DeviceSchema },
      { name: 'AuthEvent', schema: AuthEventSchema },
      { name: 'Notification', schema: NotificationSchema },
      { name: 'DailyContent', schema: DailyContentSchema },
    ])
  ],
  controllers: [
    AdminUsersController,
    AdminDevicesController,
    AdminAuthEventsController,
    AdminDailyContentController,
    AdminNotificationsController,
    AdminNotificationsSendController,
    AdminStatsController,
    AdminUsersStatsController,
    AdminDevicesStatsController,
    AdminAuthEventsStatsController,
    AdminNotificationsStatsController,
    AdminDailyContentStatsController,
  ],
  providers: [
    AdminUsersStatsService,
    AdminDevicesStatsService,
    AdminAuthEventsStatsService,
    AdminNotificationsStatsService,
    AdminDailyContentStatsService,
  ]
})
export class AdminModule {}