import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { WebsiteContentService } from './website-content.service';
import { NotificationContentService } from './notification-content.service';
import { Content, ContentSchema } from './schemas/content.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Content.name, schema: ContentSchema }
    ])
  ],
  controllers: [
    ContentController,
  ],
  providers: [
    ContentService,
    WebsiteContentService,
    NotificationContentService
  ],
  exports: [
    ContentService,
    WebsiteContentService,
    NotificationContentService
  ],
})
export class ContentModule {}