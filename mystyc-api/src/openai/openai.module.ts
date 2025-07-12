import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OpenAIService } from './openai.service';
import { OpenAIRequest, OpenAIRequestSchema } from './schemas/openai-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OpenAIRequest.name, schema: OpenAIRequestSchema },
    ]),
  ],
  providers: [OpenAIService],
  exports: [OpenAIService],
})
export class OpenAIModule {}