import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OpenAICoreService } from './openai-core.service';
import { OpenAIWebsiteService } from './openai-website.service';
import { OpenAIUserService } from './openai-user.service';
import { OpenAIUsage, OpenAIUsageSchema } from './schemas/openai-usage.schema';
import { Content, ContentSchema } from '@/content/schemas/content.schema';
import { ContentService } from '@/content/content.service';
import { UserProfile, UserProfileSchema } from '@/users/schemas/user-profile.schema';
import { UserProfilesService } from '@/users/user-profiles.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OpenAIUsage.name, schema: OpenAIUsageSchema },
      { name: Content.name, schema: ContentSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
    ]),
  ],
  providers: [
    OpenAICoreService, 
    OpenAIWebsiteService, 
    OpenAIUserService,
    ContentService,
    UserProfilesService
  ],
  exports: [
    OpenAICoreService, 
    OpenAIWebsiteService, 
    OpenAIUserService,
    ContentService,
    UserProfilesService
  ],
})
export class OpenAIModule {}