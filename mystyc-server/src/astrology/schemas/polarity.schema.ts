import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'polarities' })
export class Polarity {
  @Prop({ required: true, enum: ['Masculine', 'Feminine'], unique: true, index: true })
  polarity!: string;

  @Prop({ required: true, enum: ['Yang', 'Yin'] })
  alternativeName!: string;

  @Prop({ required: true, minlength: 50, maxlength: 500 })
  description!: string;

  @Prop({ type: [String], required: true })
  keywords!: string[];

  @Prop({ required: true, maxlength: 50 })
  energyType!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export type PolarityDocument = Polarity & Document;
export const PolaritySchema = SchemaFactory.createForClass(Polarity);

// Indexes
PolaritySchema.index({ polarity: 1 }, { unique: true });