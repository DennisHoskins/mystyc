import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OpenAIRequestDocument = OpenAIRequest & Document;

@Schema({ timestamps: true })
export class OpenAIRequest {
  @Prop({ required: true })
  inputTokens!: number;

  @Prop({ required: true })
  outputTokens!: number;

  @Prop({ required: true, enum: ['birth_chart', 'daily_insights'] })
  requestType!: 'birth_chart' | 'daily_insights';

  @Prop({ required: true })
  userId!: string; // Always the firebaseUid

  @Prop({ required: false })
  contentId?: string; // null for birth_chart, horoscope._id for daily_insights

  @Prop({ required: true })
  cost!: number; // Cost in USD

  @Prop({ required: true, default: 'gpt-4o-mini' })
  model!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const OpenAIRequestSchema = SchemaFactory.createForClass(OpenAIRequest);

// Indexes for efficient querying
OpenAIRequestSchema.index({ userId: 1, createdAt: -1 }); // User cost queries by date
OpenAIRequestSchema.index({ requestType: 1, createdAt: -1 }); // Request type analysis
OpenAIRequestSchema.index({ contentId: 1 }, { sparse: true }); // Content-specific lookups