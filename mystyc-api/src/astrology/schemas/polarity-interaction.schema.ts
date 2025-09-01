import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'polarityInteractions' })
export class PolarityInteraction {
  @Prop({ required: true, enum: ['Masculine', 'Feminine'], index: true })
  polarity1!: string;

  @Prop({ required: true, enum: ['Masculine', 'Feminine'], index: true })
  polarity2!: string;

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

  createdAt!: Date;
  updatedAt!: Date;
}

export type PolarityInteractionDocument = PolarityInteraction & Document;
export const PolarityInteractionSchema = SchemaFactory.createForClass(PolarityInteraction);

// Indexes
PolarityInteractionSchema.index({ polarity1: 1, polarity2: 1 }, { unique: true });
PolarityInteractionSchema.index({ dynamic: 1 });