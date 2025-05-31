import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { UserRole } from '@/common/enums/roles.enum';

@Schema({ timestamps: true, collection: 'users' })
export class UserProfile {
  @Prop({ required: true })
  firebaseUid: string;
  
  @Prop({ type: [String], enum: UserRole, default: [UserRole.USER], required: true })
  roles: UserRole[];  

  @Prop()
  fullName: string;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop()
  zodiacSign: string;

  @Prop()
  email: string;

  @Prop()
  currentDeviceId: string;

  createdAt: Date;
  updatedAt: Date;
}

export type UserProfileDocument = UserProfile & Document;

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);