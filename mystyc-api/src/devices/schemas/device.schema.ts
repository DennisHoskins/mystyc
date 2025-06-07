import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'devices' })
export class Device {
  @Prop({ required: true, index: true })
  firebaseUid: string;

  @Prop({ required: true, index: true })
  deviceId: string;

  @Prop({ required: true })
  platform: string;

  @Prop()
  fcmToken: string;

  @Prop()
  appVersion: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ type: Object })
  userAgentParsed: Record<string, any>;

  @Prop({ required: true })
  timezone: string;

  @Prop({ required: true })
  language: string;

  createdAt: Date;
  updatedAt: Date;
}

export type DeviceDocument = Device & Document;

export const DeviceSchema = SchemaFactory.createForClass(Device);

// Compound index for firebaseUid + deviceId
DeviceSchema.index({ firebaseUid: 1, deviceId: 1 }, { unique: true });

// Additional index for notification-ready devices
DeviceSchema.index({ fcmToken: 1 });