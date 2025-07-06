import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DailyContentController } from './daily-content.controller';
import { DailyContentService } from './daily-content.service';
import { DailyContent, DailyContentSchema } from './schemas/daily-content.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyContent.name, schema: DailyContentSchema }
    ])
  ],
  controllers: [
    DailyContentController,
  ],
  providers: [DailyContentService],
  exports: [DailyContentService],
})
export class DailyContentModule {}