import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OpenAIUsage, OpenAIUsageSchema } from './schemas/openai-usage.schema';
import { OpenAIRequest, OpenAIRequestSchema } from './schemas/openai-request.schema';
import { OpenAIUsageService } from './openai-usage.service';
import { OpenAIUserService } from './openai-user.service';
import { OpenAIHoroscopeService } from './openai-horoscope.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OpenAIUsage.name, schema: OpenAIUsageSchema },
      { name: OpenAIRequest.name, schema: OpenAIRequestSchema },
    ]),
  ],
  providers: [
    OpenAIUsageService, 
    OpenAIUserService,
    OpenAIHoroscopeService,
  ],
  exports: [
    OpenAIUsageService, 
    OpenAIUserService,
    OpenAIHoroscopeService,
  ],
})
export class OpenAIModule {}