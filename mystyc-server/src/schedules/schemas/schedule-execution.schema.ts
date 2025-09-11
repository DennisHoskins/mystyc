import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ScheduledTime {
  @Prop({ required: true, min: 0, max: 23 })
  hour!: number;

  @Prop({ required: true, min: 0, max: 59 })
  minute!: number;
}

export const ScheduledTimeSchema = SchemaFactory.createForClass(ScheduledTime);

@Schema({ timestamps: true, collection: 'scheduleExecutions' })
export class ScheduleExecution {
  @Prop({ required: true, index: true })
  scheduleId!: string;

  @Prop({ required: true, index: true })
  eventName!: string;

  @Prop({ type: ScheduledTimeSchema, required: true })
  scheduledTime!: ScheduledTime;

  @Prop({ required: true, index: true })
  executedAt!: Date;

  @Prop({ index: true })
  timezone?: string;

  @Prop()
  localTime?: Date;

  @Prop({ required: true, enum: ['running', 'completed', 'failed', 'timeout'], default: 'running', index: true })
  status!: 'running' | 'completed' | 'failed' | 'timeout';

  @Prop()
  error?: string;

  @Prop()
  duration?: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export type ScheduleExecutionDocument = ScheduleExecution & Document;

export const ScheduleExecutionSchema = SchemaFactory.createForClass(ScheduleExecution);

// Indexes for performance
ScheduleExecutionSchema.index({ scheduleId: 1, executedAt: -1 });
ScheduleExecutionSchema.index({ eventName: 1, executedAt: -1 });
ScheduleExecutionSchema.index({ status: 1, executedAt: -1 });
ScheduleExecutionSchema.index({ timezone: 1, executedAt: -1 });