import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { UsersModule } from '@/users/users.module';
import { DevicesModule } from '@/devices/devices.module';
import { AuthEventsModule } from '@/auth-events/auth-events.module';
import { FirebaseModule } from '@/auth/firebase.module';

@Module({
  imports: [UsersModule, DevicesModule, AuthEventsModule, FirebaseModule],
  controllers: [AdminController],
})
export class AdminModule {}