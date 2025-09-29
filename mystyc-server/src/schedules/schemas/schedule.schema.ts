import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ScheduleTime {
  @Prop({ required: true, min: 0, max: 23 })
  hour!: number;

  @Prop({ required: true, min: 0, max: 59 })
  minute!: number;
}

export const ScheduleTimeSchema = SchemaFactory.createForClass(ScheduleTime);

@Schema({ timestamps: true, collection: 'schedules' })
export class Schedule {
  @Prop({ type: ScheduleTimeSchema, required: true })
  time!: ScheduleTime;

  @Prop({ required: true })
  event_name!: string;

  @Prop({ required: true, default: true })
  enabled!: boolean;

  @Prop({ required: true, default: false })
  timezone_aware!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export type ScheduleDocument = Schedule & Document;
export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

// Indexes for efficient querying
ScheduleSchema.index({ 'time.hour': 1, 'time.minute': 1 });
ScheduleSchema.index({ enabled: 1, timezone_aware: 1 });
ScheduleSchema.index({ event_name: 1 });
ScheduleSchema.index({ enabled: 1, 'time.hour': 1, 'time.minute': 1 });