import { Module } from '@nestjs/common';

import { 
  AdminUsersController,
  AdminDevicesController,
  AdminAuthEventsController,
  AdminNotificationsController,
  AdminNotificationsSendController,
} from './controllers';
import { UsersModule } from '@/users/users.module';
import { DevicesModule } from '@/devices/devices.module';
import { AuthEventsModule } from '@/auth-events/auth-events.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { FirebaseModule } from '@/auth/firebase.module';

@Module({
  imports: [UsersModule, DevicesModule, AuthEventsModule, NotificationsModule, FirebaseModule],
  controllers: [
    AdminUsersController,
    AdminDevicesController,
    AdminAuthEventsController,
    AdminNotificationsController,
    AdminNotificationsSendController,
  ],
})
export class AdminModule {}