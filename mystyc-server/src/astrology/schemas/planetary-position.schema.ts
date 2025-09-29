import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'planetaryPositions' })
export class PlanetaryPosition {
  @Prop({ required: true, enum: ['Sun', 'Moon', 'Rising', 'Venus', 'Mars'], index: true })
  planet!: string;

  @Prop({ required: true, enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'], index: true })
  sign!: string;

  @Prop({ required: true, minlength: 50, maxlength: 1000 })
  description!: string;

  @Prop({ type: [String], required: true })
  keywords!: string[];

  @Prop({ required: true, maxlength: 50 })
  energyType!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export type PlanetaryPositionDocument = PlanetaryPosition & Document;
export const PlanetaryPositionSchema = SchemaFactory.createForClass(PlanetaryPosition);

// Indexes
PlanetaryPositionSchema.index({ planet: 1, sign: 1 }, { unique: true });
