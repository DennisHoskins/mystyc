import { Module } from '@nestjs/common';

import { FirebaseModule } from '@/auth/firebase.module';
import { UsersModule } from '@/users/users.module';
import { DevicesModule } from '@/devices/devices.module';

import { NotificationsService } from './notifications.service';

@Module({
  imports: [FirebaseModule, UsersModule, DevicesModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}