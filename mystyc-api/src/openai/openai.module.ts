import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Content, ContentSchema } from '@/content/schemas/content.schema';
import { ContentService } from '@/content/content.service';
import { OpenAIUsage, OpenAIUsageSchema } from './schemas/openai-usage.schema';
import { OpenAICoreService } from './openai-core.service';
import { OpenAIWebsiteService } from './openai-website.service';
import { OpenAIUserService } from './openai-user.service';
import { OpenAIUserPlusService } from './openai-user-plus.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OpenAIUsage.name, schema: OpenAIUsageSchema },
      { name: Content.name, schema: ContentSchema },
    ]),
  ],
  providers: [
    OpenAICoreService, 
    OpenAIWebsiteService, 
    OpenAIUserService,
    OpenAIUserPlusService,
    ContentService,
  ],
  exports: [
    OpenAICoreService, 
    OpenAIWebsiteService, 
    OpenAIUserService,
    OpenAIUserPlusService,
    ContentService,
  ],
})
export class OpenAIModule {}