import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';
import { AstrologyModule } from '@/astrology/astrology.module';
import { OpenAIModule } from '@/openai/openai.module';
import { UsersModule } from '@/users/users.module';

import { HoroscopesController } from './horoscopes.controller';
import { HoroscopesService } from './horoscopes.service';
import { TimezoneCoordsService } from './timezone-coords.service';
import { OpenAIHoroscopeService } from '../openai/openai-horoscope.service';
import { UserProfilesService } from '../users/user-profiles.service';

import { HoroscopeSchema } from './schemas/horoscope.schema';
import { OpenAIUsage, OpenAIUsageSchema } from '@/openai/schemas/openai-usage.schema';
import { UserProfileSchema } from '@/users/schemas/user-profile.schema';

@Module({
  imports: [
    FirebaseModule,
    AstrologyModule,
    OpenAIModule,
    UsersModule, // This already provides UserProfilesService
    MongooseModule.forFeature([
      { name: 'Horoscope', schema: HoroscopeSchema },
      { name: OpenAIUsage.name, schema: OpenAIUsageSchema },
      { name: 'UserProfile', schema: UserProfileSchema },
    ]),
  ],
  controllers: [HoroscopesController],
  providers: [
    HoroscopesService,
    TimezoneCoordsService,
    OpenAIHoroscopeService,
  ],
  exports: [
    HoroscopesService,
    TimezoneCoordsService,
    OpenAIHoroscopeService,
  ],
})
export class HoroscopesModule {}