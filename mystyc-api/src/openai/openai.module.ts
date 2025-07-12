import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OpenAIService } from './openai.service';
import { OpenAIRequest, OpenAIRequestSchema } from './schemas/openai-request.schema';
import { OpenAIUsage, OpenAIUsageSchema } from './schemas/openai-usage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OpenAIRequest.name, schema: OpenAIRequestSchema },
      { name: OpenAIUsage.name, schema: OpenAIUsageSchema },
    ]),
  ],
  providers: [OpenAIService],
  exports: [OpenAIService],
})
export class OpenAIModule {}