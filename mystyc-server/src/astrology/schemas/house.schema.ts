import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'houses' })
export class House {
  @Prop({ required: true, min: 1, max: 12, unique: true, index: true })
  houseNumber!: number;

  @Prop({ required: true, maxlength: 50 })
  name!: string;

  @Prop({ required: true, enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] })
  naturalRuler!: string;

  @Prop({ required: true, maxlength: 200 })
  lifeArea!: string;

  @Prop({ required: true, minlength: 50, maxlength: 500 })
  description!: string;

  @Prop({ type: [String], required: true })
  keywords!: string[];

  @Prop({ required: true, maxlength: 50 })
  energyType!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export type HouseDocument = House & Document;
export const HouseSchema = SchemaFactory.createForClass(House);

// Indexes
HouseSchema.index({ houseNumber: 1 }, { unique: true });
HouseSchema.index({ naturalRuler: 1 });