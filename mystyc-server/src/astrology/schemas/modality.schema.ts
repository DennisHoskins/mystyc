import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'modalities' })
export class Modality {
  @Prop({ required: true, enum: ['Cardinal', 'Fixed', 'Mutable'], unique: true, index: true })
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

export type ModalityDocument = Modality & Document;
export const ModalitySchema = SchemaFactory.createForClass(Modality);

// Indexes
ModalitySchema.index({ modality: 1 }, { unique: true });