import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'planetInteractions' })
export class PlanetInteraction {
  @Prop({ required: true, enum: ['Sun', 'Moon', 'Rising', 'Venus', 'Mars'], index: true })
  planet1!: string;

  @Prop({ required: true, enum: ['Sun', 'Moon', 'Rising', 'Venus', 'Mars'], index: true })
  planet2!: string;

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

export type PlanetInteractionDocument = PlanetInteraction & Document;
export const PlanetInteractionSchema = SchemaFactory.createForClass(PlanetInteraction);

// Indexes
PlanetInteractionSchema.index({ planet1: 1, planet2: 1 }, { unique: true });
PlanetInteractionSchema.index({ dynamic: 1 });