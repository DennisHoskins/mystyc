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

@Schema({ timestamps: true, collection: 'dailyContent' })
export class DailyContent {
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

export type DailyContentDocument = DailyContent & Document;
export const DailyContentSchema = SchemaFactory.createForClass(DailyContent);

// Indexes
DailyContentSchema.index({ date: -1 });
DailyContentSchema.index({ status: 1, date: -1 });
DailyContentSchema.index({ viewCount: -1 });
DailyContentSchema.index({ generatedAt: -1 });
DailyContentSchema.index({ sources: 1 });
