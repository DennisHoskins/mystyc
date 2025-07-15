import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';
import { DevicesModule } from '@/devices/devices.module';
import { AuthEventsModule } from '@/auth-events/auth-events.module';
import { ContentModule } from '@/content/content.module';
import { OpenAIModule } from '@/openai/openai.module';

import { UsersController } from './users.controller';

import { UsersService } from './users.service';
import { UserProfilesService } from './user-profiles.service';
import { UserRolesService } from './user-roles.service';
import { UserContentService } from '@/content/user-content.service';
import { OpenAIUserService } from '@/openai/openai-user.service';

import { UserProfileSchema } from './schemas/user-profile.schema';
import { Content, ContentSchema } from '@/content/schemas/content.schema';
import { OpenAIUsage, OpenAIUsageSchema } from '@/openai/schemas/openai-usage.schema';

@Module({
  imports: [
    FirebaseModule,
    DevicesModule,
    AuthEventsModule,
    forwardRef(() => ContentModule),
    OpenAIModule,
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
    UserContentService,
    OpenAIUserService,
  ],
  exports: [
    UsersService,
    UserProfilesService,
    UserRolesService,
    UserContentService,
    OpenAIUserService,
  ],
})
export class UsersModule {}