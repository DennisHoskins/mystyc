import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';
import { UserAuthService } from './user-auth.service';
import { UsersController } from './users.controller';
import { UserService } from './user.service';
import { UserProfileService } from './user-profile.service';
import { UserRolesService } from './user-roles.service';
import { UserProfileSchema } from './schemas/userProfile.schema';

@Module({
  imports: [
    FirebaseModule,
    MongooseModule.forFeature([{ 
      name: "UserProfile", 
      schema: UserProfileSchema,
      collection: 'userProfiles'
    }]),
  ],
  controllers: [UsersController],
  providers: [
    UserService,
    UserProfileService,
    UserRolesService,
    UserAuthService,
  ],
  exports: [
    UserService,
    UserProfileService,
    UserRolesService,
    UserAuthService,
  ],
})
export class UsersModule {}
