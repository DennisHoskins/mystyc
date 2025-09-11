import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'elements' })
export class Element {
  @Prop({ required: true, enum: ['Fire', 'Earth', 'Air', 'Water'], unique: true, index: true })
  element!: string;

  @Prop({ required: true, minlength: 50, maxlength: 500 })
  description!: string;

  @Prop({ type: [String], required: true })
  keywords!: string[];

  @Prop({ required: true, maxlength: 50 })
  energyType!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export type ElementDocument = Element & Document;
export const ElementSchema = SchemaFactory.createForClass(Element);

// Indexes
ElementSchema.index({ element: 1 }, { unique: true });