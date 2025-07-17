import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';
import { UsersModule } from '@/users/users.module';
import { SchedulesModule } from '@/schedules/schedules.module';
import { OpenAIModule } from '@/openai/openai.module';
import { WebsiteContentController } from './website-content.controller';
import { UserContentController } from './user-content.controller';
import { UserPlusContentController } from './user-plus-content.controller';
import { OpenAIController } from '@/openai/openai.controller';
import { ContentService } from './content.service';
import { WebsiteContentService } from './website-content.service';
import { UserContentService } from './user-content.service';
import { UserPlusContentService } from './user-plus-content.service';
import { NotificationContentService } from './notification-content.service';

import { Content, ContentSchema } from './schemas/content.schema';
import { OpenAIUsage, OpenAIUsageSchema } from '@/openai/schemas/openai-usage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Content.name, schema: ContentSchema },
      { name: OpenAIUsage.name, schema: OpenAIUsageSchema }
    ]),
    FirebaseModule,
    forwardRef(() => UsersModule),
    SchedulesModule,
    OpenAIModule,
  ],
  controllers: [
    WebsiteContentController,
    UserContentController,
    UserPlusContentController,
    OpenAIController,
  ],
  providers: [
    ContentService,
    WebsiteContentService,
    UserContentService,
    UserPlusContentService,
    NotificationContentService,
  ],
  exports: [
    ContentService,
    WebsiteContentService,
    UserContentService,
    UserPlusContentService,
    NotificationContentService,
  ],
})
export class ContentModule {}