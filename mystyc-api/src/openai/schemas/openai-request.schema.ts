import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'openaiRequests' })
export class OpenAIRequest {
  @Prop({ required: true })
  prompt: string;

  @Prop({ required: true })
  inputTokens: number;

  @Prop({ required: true })
  outputTokens: number;

  @Prop({ required: true })
  cost: number;

  @Prop({ required: true, enum: ['website_content', 'notification_content', 'user_content'], index: true })
  requestType: 'website_content' | 'notification_content' | 'user_content';

  @Prop({ required: true, index: true })
  linkedEntityId: string; // contentId, notificationId, or firebaseUid

  @Prop({ required: true })
  model: string;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop()
  error?: string; // If request failed

  createdAt: Date;
  updatedAt: Date;
}

export type OpenAIRequestDocument = OpenAIRequest & Document;
export const OpenAIRequestSchema = SchemaFactory.createForClass(OpenAIRequest);

// Indexes
OpenAIRequestSchema.index({ requestType: 1, createdAt: -1 });
OpenAIRequestSchema.index({ linkedEntityId: 1 });
OpenAIRequestSchema.index({ cost: -1 });
OpenAIRequestSchema.index({ createdAt: -1 });