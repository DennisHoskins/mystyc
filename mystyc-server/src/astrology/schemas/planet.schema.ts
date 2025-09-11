import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'planets' })
export class Planet {
  @Prop({ required: true, enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'], unique: true, index: true })
  planet!: string;

  @Prop({ required: true, minlength: 50, maxlength: 500 })
  description!: string;

  @Prop({ type: [String], required: true })
  keywords!: string[];

  @Prop({ required: true, min: 1, max: 5 })
  importance!: number;

  @Prop({ required: true, maxlength: 50 })
  energyType!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export type PlanetDocument = Planet & Document;
export const PlanetSchema = SchemaFactory.createForClass(Planet);

// Indexes
PlanetSchema.index({ planet: 1 }, { unique: true });
PlanetSchema.index({ importance: -1 });