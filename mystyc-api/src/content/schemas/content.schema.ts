import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class DataItem {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  value: string;
}
export const DataItemSchema = SchemaFactory.createForClass(DataItem);

@Schema({ timestamps: true, collection: 'content' })
export class Content {
  @Prop({ required: true, unique: true, index: true })
  date: string; // Format: "2025-07-07"

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  linkUrl?: string;

  @Prop()
  linkText?: string;

  @Prop({ type: [DataItemSchema], required: true })
  data: DataItem[];

  @Prop({ type: [String], default: [] })
  sources: string[]; // ["static", "horoscope-api", "openai"]

  @Prop({ required: true, enum: ['generated', 'failed', 'fallback'], default: 'generated' })
  status: 'generated' | 'failed' | 'fallback';

  @Prop()
  error?: string;

  @Prop({ required: true })
  generatedAt: Date;

  @Prop({ required: true, default: 0 })
  generationDuration: number; // milliseconds

  createdAt: Date;
  updatedAt: Date;
}

export type ContentDocument = Content & Document;
export const ContentSchema = SchemaFactory.createForClass(Content);

// Indexes
ContentSchema.index({ date: -1 });
ContentSchema.index({ status: 1, date: -1 });
ContentSchema.index({ viewCount: -1 });
ContentSchema.index({ generatedAt: -1 });
ContentSchema.index({ sources: 1 });
