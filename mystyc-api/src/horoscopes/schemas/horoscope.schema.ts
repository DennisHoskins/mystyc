import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Astrology } from '@/users/schemas/user-profile.schema';

@Schema({ timestamps: true, collection: 'horoscopes' })
export class Horoscope {
  @Prop({ required: true })
  userId!: string; // Firebase UID

  @Prop({ required: true, type: Date })
  date!: Date;

  @Prop({ required: true })
  time!: string; // "12:00"

  @Prop({ required: true })
  timezone!: string; // User's timezone from device

  @Prop({ required: true, type: Object })
  coordinates!: { lat: number; lng: number };

  // User's personalized daily energy (main result)
  @Prop({ type: Astrology, required: true })
  personalChart!: Astrology;

  // Today's cosmic energy for reference/debugging
  @Prop({ type: Astrology, required: true })
  cosmicChart!: Astrology;

  createdAt!: Date;
  updatedAt!: Date;
}

export type HoroscopeDocument = Horoscope & Document;
export const HoroscopeSchema = SchemaFactory.createForClass(Horoscope);

// Indexes - now user-specific
HoroscopeSchema.index({ userId: 1, date: 1, time: 1 }, { unique: true });
HoroscopeSchema.index({ userId: 1, createdAt: -1 }); // User's horoscope history
HoroscopeSchema.index({ date: 1 }); // Admin queries by date