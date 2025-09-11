import { Module } from '@nestjs/common';

import { FirebaseModule } from '@/auth/firebase.module';
import { UsersModule } from '@/users/users.module';
import { DevicesModule } from '@/devices/devices.module';
import { SchedulesModule } from '@/schedules/schedules.module';
import { AuthEventsModule } from '@/auth-events/auth-events.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { HoroscopesModule } from '@/horoscopes/horoscopes.module';
import { OpenAIModule } from '@/openai/openai.module';
import { PaymentsModule } from './payments/payments.module';
import { AstrologyModule } from './astrology/astrology.module';

@Module({
  imports: [
    FirebaseModule,
    UsersModule,
    DevicesModule,
    SchedulesModule,
    AuthEventsModule,
    NotificationsModule,
    HoroscopesModule,
    OpenAIModule,
    PaymentsModule,
    AstrologyModule,
  ],
  exports: [
    FirebaseModule,
    UsersModule,
    DevicesModule,
    SchedulesModule,
    AuthEventsModule,
    NotificationsModule,
    HoroscopesModule,
    OpenAIModule,
    PaymentsModule,
    AstrologyModule,
  ],
})
export class AppServicesModule {}