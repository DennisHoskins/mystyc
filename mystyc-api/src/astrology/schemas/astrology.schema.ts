import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class PlanetaryData {
  @Prop({ required: true, enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] })
  sign!: string;

  @Prop({ required: true, min: -1, max: 1 })
  totalScore!: number;

  @Prop({ type: Object })
  interactions?: Record<string, { score: number }>;
}

@Schema({ _id: false })
export class Astrology {
  @Prop({ type: PlanetaryData, required: true })
  sun!: PlanetaryData;

  @Prop({ type: PlanetaryData, required: true })
  moon!: PlanetaryData;

  @Prop({ type: PlanetaryData, required: true })
  rising!: PlanetaryData;

  @Prop({ type: PlanetaryData, required: true })
  venus!: PlanetaryData;

  @Prop({ type: PlanetaryData, required: true })
  mars!: PlanetaryData;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: Date, required: true })
  lastCalculatedAt!: Date;
}

// For standalone astrology documents (if needed for future features)
@Schema({ timestamps: true })
export class AstrologyDocument extends Astrology {
  @Prop({ type: String, required: false })
  context?: string; // e.g., "daily_reading", "user_analysis", etc.

  @Prop({ type: Date, required: false })
  date?: Date; // For date-specific astrology data

  @Prop({ type: Object, required: false })
  metadata?: any; // Flexible additional data
}

export type AstrologyDocumentType = AstrologyDocument & Document;
export const AstrologySchema = SchemaFactory.createForClass(Astrology);
export const AstrologyDocumentSchema = SchemaFactory.createForClass(AstrologyDocument);