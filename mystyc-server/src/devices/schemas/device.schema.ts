import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'devices' })
export class Device {
  @Prop({ required: true, index: true })
  firebaseUid!: string;

  @Prop({ required: true, index: true })
  deviceId!: string;

  @Prop({ required: true })
  deviceName!: string;

  @Prop({ required: true })
  platform!: string;

  @Prop()
  fcmToken!: string;

  @Prop()
  fcmTokenUpdatedAt!: Date;

  @Prop()
  appVersion!: string;

  @Prop({ required: true })
  userAgent!: string;

  @Prop({ type: Object })
  userAgentParsed!: Record<string, any>;

  @Prop({ required: true })
  timezone!: string;

  @Prop({ required: true })
  language!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export type DeviceDocument = Device & Document;

export const DeviceSchema = SchemaFactory.createForClass(Device);

// Basic functional indexes
DeviceSchema.index({ firebaseUid: 1, deviceId: 1 }, { unique: true });
DeviceSchema.index({ fcmToken: 1 });

// Notification Broadcast index
DeviceSchema.index({ timezone: 1, fcmToken: 1 });

// Admin stats performance indexes
DeviceSchema.index({ deviceId: 1 }); // For notifications lookup (if not already exists)
DeviceSchema.index({ platform: 1, updatedAt: -1 }); // Platform stats over time
DeviceSchema.index({ fcmToken: 1, fcmTokenUpdatedAt: -1 }); // FCM token stats  
DeviceSchema.index({ updatedAt: -1 }); // Recent device activity
DeviceSchema.index({ 'userAgentParsed.browser.name': 1, updatedAt: -1 }); // Browser stats
DeviceSchema.index({ 'userAgentParsed.os.name': 1, updatedAt: -1 }); // OS stats