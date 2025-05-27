import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { UsersModule } from '@/users/users.module';
import { FirebaseModule } from '@/auth/firebase.module';

@Module({
  imports: [UsersModule, FirebaseModule],
  controllers: [AdminController],
})
export class AdminModule {}