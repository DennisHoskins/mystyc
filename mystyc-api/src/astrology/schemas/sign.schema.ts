import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'signs' })
export class Sign {
  @Prop({ required: true, enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'], unique: true, index: true })
  sign!: string;

  @Prop({ required: true, enum: ['Fire', 'Earth', 'Air', 'Water'], index: true })
  element!: string;

  @Prop({ required: true, enum: ['Cardinal', 'Fixed', 'Mutable'], index: true })
  modality!: string;

  @Prop({ required: true, minlength: 50, maxlength: 500 })
  description!: string;

  @Prop({ type: [String], required: true })
  keywords!: string[];

  @Prop({ required: true, maxlength: 50 })
  energyType!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export type SignDocument = Sign & Document;
export const SignSchema = SchemaFactory.createForClass(Sign);

// Indexes
SignSchema.index({ sign: 1 }, { unique: true });
SignSchema.index({ element: 1 });
SignSchema.index({ modality: 1 });