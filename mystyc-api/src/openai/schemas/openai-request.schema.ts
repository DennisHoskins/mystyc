import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'openaiRequests' })
export class OpenAIRequest {
  @Prop({ required: true, index: true })
  date: string; // YYYY-MM-DD format

  @Prop({ required: true })
  request: string;
}

export type OpenAIRequestDocument = OpenAIRequest & Document;

export const OpenAIRequestSchema = SchemaFactory.createForClass(OpenAIRequest);

// Indexes for budget tracking and analytics
OpenAIRequestSchema.index({ date: -1 }); // Daily usage lookup
