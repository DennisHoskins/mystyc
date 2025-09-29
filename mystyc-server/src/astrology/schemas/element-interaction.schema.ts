import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'elementInteractions' })
export class ElementInteraction {
  @Prop({ required: true, enum: ['Fire', 'Earth', 'Air', 'Water'], index: true })
  element1!: string;

  @Prop({ required: true, enum: ['Fire', 'Earth', 'Air', 'Water'], index: true })
  element2!: string;

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

export type ElementInteractionDocument = ElementInteraction & Document;
export const ElementInteractionSchema = SchemaFactory.createForClass(ElementInteraction);

// Indexes
ElementInteractionSchema.index({ element1: 1, element2: 1 }, { unique: true });
ElementInteractionSchema.index({ dynamic: 1 });
