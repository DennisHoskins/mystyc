import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';
import { AstrologyModule } from '@/astrology/astrology.module';
import { OpenAIModule } from '@/openai/openai.module';
import { UsersModule } from '@/users/users.module';

import { HoroscopesController } from './horoscopes.controller';
import { HoroscopesService } from './horoscopes.service';
import { DailyEnergyService } from './daily-energy.service';
import { TimezoneCoordsService } from './timezone-coords.service';
import { CosmicNatalCompatibilityService } from './cosmic-natal-compatibility.service';
import { OpenAIHoroscopeService } from '../openai/openai-horoscope.service';
import { AstronomicalEventsService } from './astronomical-events.service';

import { HoroscopeSchema } from './schemas/horoscope.schema';
import { OpenAIUsage, OpenAIUsageSchema } from '@/openai/schemas/openai-usage.schema';
import { OpenAIRequest, OpenAIRequestSchema } from '@/openai/schemas/openai-request.schema';
import { UserProfileSchema } from '@/users/schemas/user-profile.schema';

@Module({
  imports: [
    FirebaseModule,
    AstrologyModule,
    OpenAIModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: 'Horoscope', schema: HoroscopeSchema },
      { name: OpenAIUsage.name, schema: OpenAIUsageSchema },
      { name: OpenAIRequest.name, schema: OpenAIRequestSchema },
      { name: 'UserProfile', schema: UserProfileSchema },
    ]),
  ],
  controllers: [HoroscopesController],
  providers: [
    HoroscopesService,
    DailyEnergyService,
    TimezoneCoordsService,
    CosmicNatalCompatibilityService,
    OpenAIHoroscopeService,
    AstronomicalEventsService,
  ],
  exports: [
    HoroscopesService,
    DailyEnergyService,
    TimezoneCoordsService,
    CosmicNatalCompatibilityService,
    OpenAIHoroscopeService,
    AstronomicalEventsService
  ],
})
export class HoroscopesModule {}