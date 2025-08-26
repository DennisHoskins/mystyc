// mystyc-api/src/users/users.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';
import { DevicesModule } from '@/devices/devices.module';
import { AuthEventsModule } from '@/auth-events/auth-events.module';
import { ContentModule } from '@/content/content.module';
import { OpenAIModule } from '@/openai/openai.module';
import { AstrologyModule } from '@/astrology/astrology.module';

import { UsersController } from './users.controller';

import { UsersService } from './users.service';
import { UserProfilesService } from './user-profiles.service';
import { UserRolesService } from './user-roles.service';
import { UserAstrologyService } from './user-astrology.service';
import { UserContentService } from '@/content/user-content.service';
import { UserPlusContentService } from '@/content/user-plus-content.service';
import { OpenAIUserService } from '@/openai/openai-user.service';
import { OpenAIUserPlusService } from '@/openai/openai-user-plus.service';

import { Content, ContentSchema } from '@/content/schemas/content.schema';
import { OpenAIUsage, OpenAIUsageSchema } from '@/openai/schemas/openai-usage.schema';
import { UserProfileSchema } from './schemas/user-profile.schema';

@Module({
  imports: [
    FirebaseModule,
    DevicesModule,
    AuthEventsModule,
    forwardRef(() => ContentModule),
    OpenAIModule,
    AstrologyModule, // This exports AstrologyDataService
    MongooseModule.forFeature([
      { name: "UserProfile", schema: UserProfileSchema, collection: 'userProfiles'},
      { name: Content.name, schema: ContentSchema },
      { name: OpenAIUsage.name, schema: OpenAIUsageSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserProfilesService,
    UserRolesService,
    UserAstrologyService,
    UserContentService,
    UserPlusContentService,
    OpenAIUserService,
    OpenAIUserPlusService,
  ],
  exports: [
    UsersService,
    UserProfilesService,
    UserRolesService,
    UserAstrologyService,
    UserContentService,
    UserPlusContentService,
    OpenAIUserService,
    OpenAIUserPlusService,
  ],
})
export class UsersModule {}