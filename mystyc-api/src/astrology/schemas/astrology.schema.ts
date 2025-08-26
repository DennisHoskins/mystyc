import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false }) // Don't auto-generate _id for embedded documents
export class Astrology {
  // Core signs - always present
  @Prop({ type: String, required: true })
  sunSign!: string;

  @Prop({ type: String, required: true })
  moonSign!: string;

  @Prop({ type: String, required: true })
  risingSign!: string;

  @Prop({ type: String, required: true })
  venusSign!: string;

  @Prop({ type: String, required: true })
  marsSign!: string;

  // Complete pre-assembled astrology data (optional for legacy support)
  @Prop({ type: Object, required: false })
  planetaryData?: any;

  @Prop({ type: Object, required: false })
  interactions?: any;

  // Metadata
  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: Date, required: false })
  lastCalculatedAt?: Date;
}

// For standalone astrology documents (if you need them)
@Schema({ timestamps: true })
export class AstrologyDocument extends Astrology {
  // Additional fields for standalone documents
  @Prop({ type: String, required: false })
  context?: string; // e.g., "daily_reading", "user_profile", etc.

  @Prop({ type: Date, required: false })
  date?: Date; // For date-specific astrology info

  @Prop({ type: Object, required: false })
  metadata?: any; // Flexible additional data
}

export type AstrologyDocumentType = AstrologyDocument & Document;
export const AstrologySchema = SchemaFactory.createForClass(Astrology);
export const AstrologyDocumentSchema = SchemaFactory.createForClass(AstrologyDocument);