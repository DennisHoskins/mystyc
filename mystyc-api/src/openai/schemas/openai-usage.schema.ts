import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'openaiUsage' })
export class OpenAIUsage {
  @Prop({ required: true, index: true })
  date: string; // YYYY-MM-DD format

  @Prop({ required: true })
  model: string; // 'gpt-4o-mini'

  @Prop({ required: true })
  inputTokens: number;

  @Prop({ required: true })
  outputTokens: number;

  @Prop({ required: true })
  cost: number; // USD cost

  @Prop({ required: true, enum: ['website_content', 'notification_content'], index: true })
  requestType: 'website_content' | 'notification_content';

  @Prop({ required: true })
  prompt: string; // First 500 chars for debugging

  @Prop({ required: true })
  response: string; // First 500 chars for debugging

  @Prop({ required: true, index: true })
  timestamp: Date;

   @Prop({ index: true })
  lastSyncedAt: Date;

  @Prop({ enum: ['success', 'failed'] })
  syncStatus: 'success' | 'failed';

  createdAt: Date;
  updatedAt: Date;
}

export type OpenAIUsageDocument = OpenAIUsage & Document;

export const OpenAIUsageSchema = SchemaFactory.createForClass(OpenAIUsage);

// Indexes for budget tracking and analytics
OpenAIUsageSchema.index({ date: -1 }); // Daily usage lookup
OpenAIUsageSchema.index({ timestamp: -1 }); // Recent usage
OpenAIUsageSchema.index({ requestType: 1, date: -1 }); // Usage by type
OpenAIUsageSchema.index({ cost: -1 }); // Most expensive requests
OpenAIUsageSchema.index({ lastSyncedAt: -1 }); // Last cache refresh