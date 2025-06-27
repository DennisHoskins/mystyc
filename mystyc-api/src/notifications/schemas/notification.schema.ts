import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ required: true, index: true })
  firebaseUid: string;

  @Prop({ index: true })
  deviceId?: string;

  @Prop()
  fcmToken?: string; // The actual FCM token used to send

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ required: true, enum: ['test', 'admin', 'broadcast'], index: true })
  type: 'test' | 'admin' | 'broadcast';

  @Prop({ required: true, enum: ['api'], default: 'api', index: true })
  source: 'api';

  @Prop({ required: true, enum: ['pending', 'sent', 'failed'], default: 'pending', index: true })
  status: 'pending' | 'sent' | 'failed';

  @Prop()
  messageId?: string;

  @Prop()
  error?: string;

  @Prop({ required: true, index: true })
  sentBy: string;

  @Prop()
  sentAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = Notification & Document;

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Compound indexes for common queries
NotificationSchema.index({ firebaseUid: 1, createdAt: -1 });
NotificationSchema.index({ sentBy: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, source: 1, createdAt: -1 });