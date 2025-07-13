import { Module } from '@nestjs/common';

import { FirebaseModule } from '@/auth/firebase.module';
import { UsersModule } from '@/users/users.module';
import { DevicesModule } from '@/devices/devices.module';
import { ScheduleModule } from '@/schedule/schedule.module';
import { AuthEventsModule } from '@/auth-events/auth-events.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { ContentModule } from '@/content/content.module';
import { OpenAIModule } from '@/openai/openai.module';

@Module({
  imports: [
    FirebaseModule,
    UsersModule,
    DevicesModule,
    ScheduleModule,
    AuthEventsModule,
    NotificationsModule,
    ContentModule,
    OpenAIModule,
  ],
  exports: [
    FirebaseModule,
    UsersModule,
    DevicesModule,
    ScheduleModule,
    AuthEventsModule,
    NotificationsModule,
    ContentModule,
    OpenAIModule,
  ],
})
export class AppServicesModule {}