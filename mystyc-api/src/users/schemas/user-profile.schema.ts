import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { UserRole } from '@/common/enums/roles.enum';
import { SubscriptionLevel } from '@/common/enums/subscription-levels.enum';

@Schema()
export class Subscription {
  @Prop({ type: String, enum: SubscriptionLevel, default: SubscriptionLevel.USER, required: true })
  level: SubscriptionLevel;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Number, default: 0 })
  creditBalance: number;
}

@Schema({ timestamps: true, collection: 'userProfiles' })
export class UserProfile {
  @Prop({ required: true })
  firebaseUid: string;

  @Prop()
  emailAddress: string;
  
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

  @Prop({ type: Subscription, default: () => ({}) })
  subscription: Subscription;

  @Prop({ sparse: true, index: true })
  stripeCustomerId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type UserProfileDocument = UserProfile & Document;

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

// Basic functional indexes
UserProfileSchema.index({ firebaseUid: 1 }, { unique: true });
UserProfileSchema.index({ email: 1 });

// Admin stats performance indexes
UserProfileSchema.index({ createdAt: -1 }); // Registration trends
UserProfileSchema.index({ roles: 1, createdAt: -1 }); // Admin users over time
UserProfileSchema.index({ updatedAt: -1 }); // Activity tracking

// Profile completion stats indexes
UserProfileSchema.index({ fullName: 1, createdAt: -1 }); // Users with names
UserProfileSchema.index({ dateOfBirth: 1, createdAt: -1 }); // Users with birthdays  
UserProfileSchema.index({ zodiacSign: 1, createdAt: -1 }); // Users with zodiac signs

// Subscription-related indexes
UserProfileSchema.index({ 'subscription.level': 1 }); // Find users by subscription tier
UserProfileSchema.index({ 'subscription.level': 1, 'subscription.startDate': -1 }); // Content access queries
UserProfileSchema.index({ 'subscription.creditBalance': -1 }); // PRO users with low credits
UserProfileSchema.index({ stripeCustomerId: 1 }, { sparse: true }); // Stripe ID lookup