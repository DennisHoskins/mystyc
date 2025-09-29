import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';
import { DevicesModule } from '@/devices/devices.module';
import { AuthEventsModule } from '@/auth-events/auth-events.module';
import { OpenAIModule } from '@/openai/openai.module';
import { AstrologyModule } from '@/astrology/astrology.module';

import { UsersController } from './users.controller';

import { UsersService } from './users.service';
import { UserProfilesService } from './user-profiles.service';
import { UserRolesService } from './user-roles.service';
import { OpenAIUserService } from '@/openai/openai-user.service';

import { OpenAIUsage, OpenAIUsageSchema } from '@/openai/schemas/openai-usage.schema';
import { OpenAIRequest, OpenAIRequestSchema } from '@/openai/schemas/openai-request.schema';
import { UserProfileSchema } from './schemas/user-profile.schema';

@Module({
  imports: [
    FirebaseModule,
    DevicesModule,
    AuthEventsModule,
    OpenAIModule,
    AstrologyModule, // This exports AstrologyDataService
    MongooseModule.forFeature([
      { name: "UserProfile", schema: UserProfileSchema, collection: 'userProfiles'},
      { name: OpenAIUsage.name, schema: OpenAIUsageSchema },
      { name: OpenAIRequest.name, schema: OpenAIRequestSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserProfilesService,
    UserRolesService,
    OpenAIUserService,
  ],
  exports: [
    UsersService,
    UserProfilesService,
    UserRolesService,
    OpenAIUserService,
  ],
})
export class UsersModule {}