import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'dynamics' })
export class Dynamic {
  @Prop({ required: true, enum: ['harmony', 'tension', 'complementary', 'amplification'], unique: true, index: true })
  dynamic!: string;

  @Prop({ required: true, minlength: 50, maxlength: 500 })
  description!: string;

  @Prop({ type: [String], required: true })
  keywords!: string[];

  @Prop({ required: true, min: -1, max: 1 })
  scoreValue!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export type DynamicDocument = Dynamic & Document;
export const DynamicSchema = SchemaFactory.createForClass(Dynamic);

// Indexes
DynamicSchema.index({ dynamic: 1 }, { unique: true });
DynamicSchema.index({ scoreValue: -1 });