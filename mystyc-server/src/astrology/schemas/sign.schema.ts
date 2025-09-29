import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class SignBasics {
  @Prop({ required: true, enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] })
  rulingPlanet!: string;

  @Prop({ enum: ['Uranus', 'Neptune', 'Pluto'] })
  modernRulingPlanet?: string;

  @Prop({ required: true, enum: ['Masculine', 'Feminine'] })
  polarity!: string;

  @Prop({ required: true, min: 1, max: 12 })
  naturalHouse!: number;

  @Prop({ required: true, maxlength: 5 })
  unicodeSymbol!: string;

  @Prop({ required: true, maxlength: 5 })
  emoji!: string;
}

@Schema({ _id: false })
export class SignTiming {
  @Prop({ type: Object, required: true })
  dateRange!: {
    start: string;
    end: string;
  };

  @Prop({ required: true, maxlength: 50 })
  season!: string;

  @Prop({ required: true, maxlength: 200 })
  seasonDescription!: string;
}

@Schema({ _id: false })
export class SignSymbol {
  @Prop({ required: true, maxlength: 30 })
  name!: string;

  @Prop({ required: true, minlength: 100, maxlength: 1000 })
  description!: string;

  @Prop({ required: true, minlength: 200, maxlength: 2000 })
  mythologicalStory!: string;

  @Prop({ type: [String], required: true })
  mythologicalFigures!: string[];
}

@Schema({ _id: false })
export class SignGems {
  @Prop({ type: [String], required: true })
  birthstones!: string[];

  @Prop({ type: [String], required: true })
  crystals!: string[];

  @Prop({ type: [String], required: true })
  meanings!: string[];
}

@Schema({ _id: false })
export class SignLucky {
  @Prop({ type: [Number], required: true })
  numbers!: number[];

  @Prop({ required: true, maxlength: 20 })
  day!: string;

  @Prop({ required: true, maxlength: 50 })
  times!: string;

  @Prop({ type: [String], required: true })
  colors!: string[];
}

@Schema({ _id: false })
export class SignPhysical {
  @Prop({ type: [String], required: true })
  bodyParts!: string[];

  @Prop({ type: [String], required: true })
  healthFocus!: string[];

  @Prop({ type: [String], required: true })
  exerciseStyles!: string[];
}

@Schema({ _id: false })
export class SignLifestyle {
  @Prop({ type: [String], required: true })
  careers!: string[];

  @Prop({ type: [String], required: true })
  hobbies!: string[];

  @Prop({ type: [String], required: true })
  cuisines!: string[];

  @Prop({ type: [String], required: true })
  musicGenres!: string[];
}

@Schema({ _id: false })
export class SignTarot {
  @Prop({ required: true, maxlength: 50 })
  majorArcana!: string;

  @Prop({ type: [String], required: true })
  courtCards!: string[];

  @Prop({ type: [String], required: true })
  minorArcana!: string[];

  @Prop({ required: true, maxlength: 200 })
  meaning!: string;
}

@Schema({ _id: false })
export class SignAesthetic {
  @Prop({ type: [String], required: true })
  fashionStyle!: string[];

  @Prop({ type: [String], required: true })
  homeDecor!: string[];

  @Prop({ type: [String], required: true })
  artStyles!: string[];
}

@Schema({ timestamps: true, collection: 'signs' })
export class Sign {
  @Prop({ required: true, enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'], unique: true, index: true })
  sign!: string;

  @Prop({ required: true, enum: ['Fire', 'Earth', 'Air', 'Water'], index: true })
  element!: string;

  @Prop({ required: true, enum: ['Cardinal', 'Fixed', 'Mutable'], index: true })
  modality!: string;

  @Prop({ required: true, minlength: 50, maxlength: 500 })
  description!: string;

  @Prop({ type: [String], required: true })
  keywords!: string[];

  @Prop({ required: true, maxlength: 50 })
  energyType!: string;

  // New nested objects
  @Prop({ type: SignBasics, required: true })
  basics!: SignBasics;

  @Prop({ type: SignTiming, required: true })
  timing!: SignTiming;

  @Prop({ type: SignSymbol, required: true })
  symbol!: SignSymbol;

  @Prop({ type: SignGems, required: true })
  gems!: SignGems;

  @Prop({ type: SignLucky, required: true })
  lucky!: SignLucky;

  @Prop({ type: SignPhysical, required: true })
  physical!: SignPhysical;

  @Prop({ type: SignLifestyle, required: true })
  lifestyle!: SignLifestyle;

  @Prop({ type: SignTarot, required: true })
  tarot!: SignTarot;

  @Prop({ type: SignAesthetic, required: true })
  aesthetic!: SignAesthetic;

  createdAt!: Date;
  updatedAt!: Date;
}

export type SignDocument = Sign & Document;
export const SignSchema = SchemaFactory.createForClass(Sign);

// Indexes
SignSchema.index({ sign: 1 }, { unique: true });
SignSchema.index({ element: 1 });
SignSchema.index({ modality: 1 });
SignSchema.index({ 'basics.polarity': 1 });
SignSchema.index({ 'basics.naturalHouse': 1 });