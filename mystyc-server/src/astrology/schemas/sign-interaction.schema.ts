import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'signInteractions' })
export class SignInteraction {
  @Prop({ required: true, enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'], index: true })
  sign1!: string;

  @Prop({ required: true, enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'], index: true })
  sign2!: string;

  @Prop({ required: true, min: 0, max: 6 })
  distance!: number;  
  
  @Prop({ required: true, enum: ['harmony', 'tension', 'complementary', 'amplification'], index: true })
  dynamic!: string;

  @Prop({ required: true, minlength: 50, maxlength: 500 })
  description!: string;

  @Prop({ type: [String], required: true })
  keywords!: string[];

  @Prop({ required: true, maxlength: 50 })
  energyType!: string;

  @Prop({ required: true, minlength: 20, maxlength: 300 })
  action!: string;

  // Compatibility scoring
  @Prop({ required: true, min: -1, max: 1 })
  totalScore!: number;

  @Prop({ required: true, min: -1, max: 1 })
  elementScore!: number;

  @Prop({ required: true, min: -1, max: 1 })
  modalityScore!: number;

  @Prop({ required: true, min: -1, max: 1 })
  polarityScore!: number;

  @Prop({ required: true, min: -1, max: 1 })
  dynamicScore!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export type SignInteractionDocument = SignInteraction & Document;
export const SignInteractionSchema = SchemaFactory.createForClass(SignInteraction);

// Indexes
SignInteractionSchema.index({ sign1: 1, sign2: 1 }, { unique: true });
SignInteractionSchema.index({ dynamic: 1 });
SignInteractionSchema.index({ totalScore: -1 });