import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ContentType {
  WEBSITE = 'website_content',
  BLOG_POST = 'blog_content',
  NOTIFICATION_CONTENT = 'notification_content',
  USER_CONTENT = 'user_content',
  PLUS_CONTENT = 'plus_content',
  PRO_CONTENT = 'pro_content',
}

@Schema()
export class DataItem {
  @Prop({ required: true })
  key!: string;

  @Prop({ required: true })
  value!: string;
}
export const DataItemSchema = SchemaFactory.createForClass(DataItem);

@Schema()
export class OpenAIData {
  @Prop()
  prompt?: string;

  @Prop()
  model?: string;

  @Prop()
  inputTokens?: number;

  @Prop()
  outputTokens?: number;

  @Prop()
  cost?: number;

  @Prop()
  retryCount?: number;
}
export const OpenAIDataSchema = SchemaFactory.createForClass(OpenAIData);

@Schema({ timestamps: true, collection: 'content' })
export class Content {
  @Prop({ 
    type: String, 
    enum: ContentType, 
    default: ContentType.WEBSITE,
    index: true 
  })
  type!: ContentType;

  @Prop({ required: true, index: true })
  date!: string; // Format: "2025-07-07"

  @Prop({ index: true })
  scheduleId?: string;

  @Prop({ index: true })
  executionId?: string;

  @Prop({ index: true })
  notificationId?: string;

  @Prop({ index: true })
  userId?: string;

  @Prop()
  openAIData?: OpenAIData;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  linkUrl?: string;

  @Prop()
  linkText?: string;

  @Prop({ type: [DataItemSchema], required: true })
  data!: DataItem[];

  @Prop({ type: [String], default: [] })
  sources!: string[]; // ["static", "horoscope-api", "openai"]

  @Prop({ required: true, enum: ['pending', 'generated', 'failed', 'fallback'], default: 'generated' })
  status!: 'pending' | 'generated' | 'failed' | 'fallback';

  @Prop()
  error?: string;

  @Prop({ required: true })
  generatedAt!: Date;

  @Prop({ required: true, default: 0 })
  generationDuration!: number; // milliseconds

  createdAt!: Date;
  updatedAt!: Date;
}

export type ContentDocument = Content & Document;
export const ContentSchema = SchemaFactory.createForClass(Content);

// Indexes
ContentSchema.index({ type: 1, date: -1 });
ContentSchema.index({ type: 1, status: 1 });
ContentSchema.index({ date: -1 });
ContentSchema.index({ scheduleId: -1 });
ContentSchema.index({ executionId: -1 });
ContentSchema.index({ notificationId: -1 });
ContentSchema.index({ userId: -1 });
ContentSchema.index({ status: 1, date: -1 });
ContentSchema.index({ generatedAt: -1 });
ContentSchema.index({ sources: 1 });
ContentSchema.index({ viewCount: -1 });
ContentSchema.index({ "openAIData.cost": -1 });