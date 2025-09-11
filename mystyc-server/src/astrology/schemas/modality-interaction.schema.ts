import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'modalityInteractions' })
export class ModalityInteraction {
  @Prop({ required: true, enum: ['Cardinal', 'Fixed', 'Mutable'], index: true })
  modality1!: string;

  @Prop({ required: true, enum: ['Cardinal', 'Fixed', 'Mutable'], index: true })
  modality2!: string;

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

export type ModalityInteractionDocument = ModalityInteraction & Document;
export const ModalityInteractionSchema = SchemaFactory.createForClass(ModalityInteraction);

// Indexes
ModalityInteractionSchema.index({ modality1: 1, modality2: 1 }, { unique: true });
ModalityInteractionSchema.index({ dynamic: 1 });