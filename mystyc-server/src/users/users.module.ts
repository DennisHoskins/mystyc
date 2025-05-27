import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';
import { UserAuthService } from './user-auth.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
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
    UsersService,
    UserAuthService,
  ],
  exports: [UsersService, UserAuthService],
})
export class UsersModule {}