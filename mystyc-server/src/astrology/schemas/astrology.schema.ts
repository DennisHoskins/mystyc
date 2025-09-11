import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PlanetaryDataSchema } from '@/users/schemas/user-profile.schema';

@Schema({ _id: false })
export class Astrology {
  @Prop({ type: PlanetaryDataSchema, required: true })
  sun!: PlanetaryDataSchema;

  @Prop({ type: PlanetaryDataSchema, required: true })
  moon!: PlanetaryDataSchema;

  @Prop({ type: PlanetaryDataSchema, required: true })
  rising!: PlanetaryDataSchema;

  @Prop({ type: PlanetaryDataSchema, required: true })
  venus!: PlanetaryDataSchema;

  @Prop({ type: PlanetaryDataSchema, required: true })
  mars!: PlanetaryDataSchema;

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