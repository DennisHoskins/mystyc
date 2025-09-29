import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { UserRole } from 'mystyc-common/constants/roles.enum';
import { SubscriptionLevel } from 'mystyc-common/constants/subscription-levels.enum';

@Schema()
export class Subscription {
  @Prop({ type: String, enum: SubscriptionLevel, default: SubscriptionLevel.USER, required: true })
  level!: SubscriptionLevel;

  @Prop({ type: Date })
  startDate!: Date;

  @Prop({ type: Number, default: 0 })
  creditBalance!: number;
}

@Schema()
export class BirthLocation {
  @Prop({ required: true })
  placeId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  formattedAddress!: string;

  @Prop({
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    required: true,
  })
  coordinates!: {
    lat: number;
    lng: number;
  };

  @Prop({
    type: {
      name: { type: String, required: true },
      offsetHours: { type: Number, required: true }
    },
    required: true
  })
  timezone!: {
    name: string;
    offsetHours: number;
  };
}

@Schema({ _id: false })
export class PlanetaryInteractionScore {
  @Prop({ required: true, min: -1, max: 1 })
  score!: number;

  @Prop({ minlength: 50, maxlength: 1000 })
  description?: string;
}

@Schema({ _id: false })
export class AISummary {
  @Prop({ minlength: 50, maxlength: 1000 })
  description?: string;

  @Prop({ minlength: 20, maxlength: 1000 })
  strengths?: string;

  @Prop({ minlength: 20, maxlength: 1000 })
  challenges?: string;

  @Prop({ minlength: 20, maxlength: 1000 })
  action?: string;
}

@Schema({ _id: false })
export class PlanetaryDataSchema {
  @Prop({ required: true, enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] })
  sign!: string;

  @Prop({ required: false, min: 0, max: 29.999 })
  degreesInSign?: number;

  @Prop({ required: false, min: 0, max: 359.999 })
  absoluteDegrees?: number;

  @Prop({ required: true, min: -1, max: 1 })
  totalScore!: number;

  @Prop({ type: AISummary })
  summary?: AISummary;

  @Prop({ type: Object })
  interactions?: Record<string, { score: number, description: string }>;
}

@Schema({ _id: false })
export class Astrology {
  @Prop({ type: PlanetaryDataSchema, required: true })
  sun!: PlanetaryDataSchema;

  @Prop({ type: PlanetaryDataSchema, required: true })
  moon!: PlanetaryDataSchema;

  @Prop({ type: PlanetaryDataSchema, required: true })
  rising!: PlanetaryDataSchema;

  @Prop({ type: PlanetaryDataSchema, required: true })
  venus!: PlanetaryDataSchema;

  @Prop({ type: PlanetaryDataSchema, required: true })
  mars!: PlanetaryDataSchema;

  @Prop({ required: true, min: -1, max: 1 })
  totalScore!: number;

  @Prop({ type: AISummary })
  summary?: AISummary;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: Date, required: true })
  lastCalculatedAt!: Date;
}

@Schema({ timestamps: true, collection: 'userProfiles' })
export class UserProfile {
  @Prop({ required: true })
  firebaseUid!: string;

  @Prop()
  email!: string;
  
  @Prop({ type: [String], enum: UserRole, default: [UserRole.USER], required: true })
  roles!: UserRole[];  

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ type: Date })
  dateOfBirth?: Date;

  @Prop()
  timeOfBirth?: string;

  @Prop({ type: Boolean, default: false })
  hasTimeOfBirth!: boolean;

  @Prop({ type: BirthLocation })
  birthLocation?: BirthLocation;

  @Prop({ type: Astrology })
  astrology?: Astrology;

  @Prop({ type: Subscription, default: () => ({}) })
  subscription!: Subscription;

  @Prop({ sparse: true, index: true })
  stripeCustomerId?: string;

  createdAt!: Date;
  updatedAt!: Date;
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
UserProfileSchema.index({ firstName: 1, createdAt: -1 }); // Users with first names
UserProfileSchema.index({ lastName: 1, createdAt: -1 }); // Users with last names
UserProfileSchema.index({ dateOfBirth: 1, createdAt: -1 }); // Users with birthdays  
UserProfileSchema.index({ 'birthLocation.placeId': 1, createdAt: -1 }); // Users with birth locations
UserProfileSchema.index({ 'astrology.sun.sign': 1, createdAt: -1 }); // Users with astrology data

// Birthday messaging indexes
UserProfileSchema.index({ dateOfBirth: 1 }); // General birthday queries

// Subscription-related indexes
UserProfileSchema.index({ 'subscription.level': 1 }); // Find users by subscription tier
UserProfileSchema.index({ 'subscription.level': 1, 'subscription.startDate': -1 }); // Content access queries
UserProfileSchema.index({ 'subscription.creditBalance': -1 }); // PRO users with low credits
UserProfileSchema.index({ stripeCustomerId: 1 }, { sparse: true }); // Stripe ID lookup