import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ required: true, index: true })
  firebaseUid!: string;

  @Prop({ index: true })
  deviceId?: string;

  @Prop({ index: true })
  deviceName?: string;

  @Prop()
  fcmToken?: string; // The actual FCM token used to send

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({ required: true, enum: ['test', 'admin', 'broadcast', 'schedule'], index: true })
  type!: 'test' | 'admin' | 'broadcast' | 'schedule';

  @Prop({ required: true, enum: ['api'], default: 'api', index: true })
  source!: 'api';

  @Prop({ required: true, enum: ['pending', 'sent', 'failed'], default: 'pending', index: true })
  status!: 'pending' | 'sent' | 'failed';

  @Prop()
  messageId?: string;

  @Prop()
  error?: string;

  @Prop({ required: true, index: true })
  sentBy!: string;

  @Prop()
  sentAt?: Date;

  @Prop({ index: true })
  scheduleId?: string;

  @Prop({ index: true })
  executionId?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export type NotificationDocument = Notification & Document;

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Basic functional indexes
NotificationSchema.index({ firebaseUid: 1, createdAt: -1 });
NotificationSchema.index({ deviceId: 1, createdAt: -1 });
NotificationSchema.index({ scheduleId: 1, createdAt: -1 });
NotificationSchema.index({ executionId: 1, createdAt: -1 });
NotificationSchema.index({ sentBy: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, source: 1, createdAt: -1 });

// Admin stats performance indexes
NotificationSchema.index({ createdAt: -1 }); // All notifications by time (most important for admin stats)
NotificationSchema.index({ type: 1, status: 1, createdAt: -1 }); // Combined type + status analysis
NotificationSchema.index({ status: 1, sentAt: 1, createdAt: 1 }); // Delivery time calculation
