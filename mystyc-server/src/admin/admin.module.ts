import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { UsersModule } from '@/users/users.module';
import { DevicesModule } from '@/devices/devices.module';
import { AuthEventsModule } from '@/auth-events/auth-events.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { FirebaseModule } from '@/auth/firebase.module';

@Module({
  imports: [UsersModule, DevicesModule, AuthEventsModule, NotificationsModule, FirebaseModule],
  controllers: [AdminController],
})
export class AdminModule {}