import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OpenAIUsage, OpenAIUsageSchema } from './schemas/openai-usage.schema';
import { OpenAIUsageService } from './openai-usage.service';
import { OpenAIUserService } from './openai-user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OpenAIUsage.name, schema: OpenAIUsageSchema },
    ]),
  ],
  providers: [
    OpenAIUsageService, 
    OpenAIUserService,
  ],
  exports: [
    OpenAIUsageService, 
    OpenAIUserService,
  ],
})
export class OpenAIModule {}