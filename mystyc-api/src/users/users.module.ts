import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';
import { DevicesModule } from '@/devices/devices.module';
import { AuthEventsModule } from '@/auth-events/auth-events.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserProfilesService } from './user-profiles.service';
import { UserRolesService } from './user-roles.service';
import { UserProfileSchema } from './schemas/userProfile.schema';

@Module({
  imports: [
    FirebaseModule,
    DevicesModule,
    AuthEventsModule,
    MongooseModule.forFeature([{ 
      name: "UserProfile", 
      schema: UserProfileSchema,
      collection: 'userProfiles'
    }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserProfilesService,
    UserRolesService,
  ],
  exports: [
    UsersService,
    UserProfilesService,
    UserRolesService,
  ],
})
export class UsersModule {}