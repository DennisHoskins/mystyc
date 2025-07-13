import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';
import { UsersModule } from '@/users/users.module';
import { ScheduleModule } from '@/schedule/schedule.module';
import { ContentController } from './content.controller';
import { OpenAIController } from '@/openai/openai.controller';
import { ContentService } from './content.service';
import { WebsiteContentService } from './website-content.service';
import { NotificationContentService } from './notification-content.service';
import { OpenAIService } from '@/openai/openai.service';

import { Content, ContentSchema } from './schemas/content.schema';
import { OpenAIRequest, OpenAIRequestSchema } from '@/openai/schemas/openai-request.schema';
import { OpenAIUsage, OpenAIUsageSchema } from '@/openai/schemas/openai-usage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Content.name, schema: ContentSchema },
      { name: OpenAIRequest.name, schema: OpenAIRequestSchema },
      { name: OpenAIUsage.name, schema: OpenAIUsageSchema }
    ]),
    FirebaseModule,
    UsersModule,
    ScheduleModule
  ],
  controllers: [
    ContentController,
    OpenAIController,
  ],
  providers: [
    ContentService,
    WebsiteContentService,
    NotificationContentService,
    OpenAIService,
  ],
  exports: [
    ContentService,
    WebsiteContentService,
    NotificationContentService,
    OpenAIService,
  ],
})
export class ContentModule {}