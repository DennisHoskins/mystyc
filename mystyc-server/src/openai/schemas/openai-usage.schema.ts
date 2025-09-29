import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OpenAIUsageDocument = OpenAIUsage & Document;

@Schema({ timestamps: true })
export class OpenAIUsage {
  @Prop({ required: true, unique: true })
  month!: string;         // "YYYY-MM"

  @Prop({ required: true, default: 0 })
  totalRequests?: number;

  @Prop({ required: true, default: 0 })
  tokensUsed!: number;

  @Prop({ required: true, default: 0 })
  costUsed!: number;      // in USD

  @Prop({ required: true })
  tokenBudget!: number;

  @Prop({ required: true })
  costBudget!: number;    // in USD

  @Prop()
  lastSyncedAt!: Date;
}

export const OpenAIUsageSchema = SchemaFactory.createForClass(OpenAIUsage);
OpenAIUsageSchema.index({ month: 1 });
