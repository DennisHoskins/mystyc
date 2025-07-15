import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OpenAICoreService } from './openai-core.service';
import { OpenAIWebsiteService } from './openai-website.service';
import { OpenAIUserService } from './openai-user.service';
import { OpenAIUsage, OpenAIUsageSchema } from './schemas/openai-usage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OpenAIUsage.name, schema: OpenAIUsageSchema },
    ]),
  ],
  providers: [
    OpenAICoreService, 
    OpenAIWebsiteService, 
    OpenAIUserService
  ],
  exports: [
    OpenAICoreService, 
    OpenAIWebsiteService, 
    OpenAIUserService
  ],
})
export class OpenAIModule {}