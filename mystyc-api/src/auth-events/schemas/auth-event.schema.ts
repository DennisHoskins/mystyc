import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'authEvents' })
export class AuthEvent {
  @Prop({ required: true, index: true })
  firebaseUid: string;

  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true, index: true })
  deviceId: string;

  @Prop({ required: true, index: true })
  deviceName: string;

  @Prop({ required: true, enum: ['create', 'login', 'logout', 'server-logout'], index: true })
  type: 'create' | 'login' | 'logout' | 'server-logout';

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true, index: true })
  timestamp: Date; // server UTC

  @Prop({ required: true })
  clientTimestamp: Date; // client-provided

  createdAt: Date;
  updatedAt: Date;
}

export type AuthEventDocument = AuthEvent & Document;

export const AuthEventSchema = SchemaFactory.createForClass(AuthEvent);

// Additional indexes for queries
AuthEventSchema.index({ firebaseUid: 1, timestamp: -1 });
AuthEventSchema.index({ deviceId: 1, timestamp: -1 });
AuthEventSchema.index({ type: 1, timestamp: -1 });