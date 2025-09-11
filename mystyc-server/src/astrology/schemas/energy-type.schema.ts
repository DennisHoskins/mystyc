import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'energyTypes' })
export class EnergyType {
  @Prop({ required: true, maxlength: 50, unique: true, index: true })
  energyType!: string;

  @Prop({ required: true, minlength: 50, maxlength: 500 })
  description!: string;

  @Prop({ type: [String], required: true })
  keywords!: string[];

  @Prop({ required: true, enum: ['spiritual', 'emotional', 'mental', 'physical'], index: true })
  category!: string;

  @Prop({ required: true, min: 1, max: 10 })
  intensity!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export type EnergyTypeDocument = EnergyType & Document;
export const EnergyTypeSchema = SchemaFactory.createForClass(EnergyType);

// Indexes
EnergyTypeSchema.index({ energyType: 1 }, { unique: true });
EnergyTypeSchema.index({ category: 1 });
EnergyTypeSchema.index({ intensity: -1 });