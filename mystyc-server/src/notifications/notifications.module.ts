import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';
import { UsersModule } from '@/users/users.module';
import { DevicesModule } from '@/devices/devices.module';
import { SchedulesModule } from '@/schedules/schedules.module';

import { NotificationsService } from './notifications.service';
import { Notification, NotificationSchema } from './schemas/notification.schema';

@Module({
  imports: [
    FirebaseModule, 
    UsersModule, 
    DevicesModule,
    SchedulesModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema }
    ])
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}