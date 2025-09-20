import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Horoscope } from 'mystyc-common/interfaces/horoscope.interface';
import { PlanetType, ZodiacSignType } from 'mystyc-common/schemas';
import { DailyAstronomicalEvents } from 'mystyc-common/interfaces';
import { AstronomicalEventsService } from './astronomical-events.service';

import { logger } from '@/common/util/logger';
import { AstrologyService, CoreAstrology } from '@/astrology/services/astrology.service';
import { AstrologyDataService } from '@/astrology/services/astrology-data.service';
import { UserProfilesService } from '@/users/user-profiles.service';
import { HoroscopeDocument } from './schemas/horoscope.schema';
import { TimezoneCoordsService } from './timezone-coords.service';
import { OpenAIHoroscopeService } from '../openai/openai-horoscope.service';
import { SignsService } from '@/astrology/services/signs.service';
import { calculateCompatibility } from 'mystyc-common/util/astrology-calculations';

@Injectable()
export class HoroscopesService {
  protected DEFAULT_HOROSCOPE_TIME = '8:00';

  constructor(
    @InjectModel('Horoscope') private horoscopeModel: Model<HoroscopeDocument>,
    private readonly astrologyService: AstrologyService,
    private readonly astrologyDataService: AstrologyDataService,
    private readonly astronomicalEventsService: AstronomicalEventsService,
    private readonly userProfilesService: UserProfilesService,
    private readonly timezoneCoordsService: TimezoneCoordsService,
    private readonly openAiHoroscopeService: OpenAIHoroscopeService,
    private readonly signsService: SignsService,
  ) {}

  async getOrCreatePersonalHoroscope(
    userId: string,
    date: string,
    time?: string,
    timezone?: string
  ): Promise<Horoscope> {
    const effectiveTime = time || this.DEFAULT_HOROSCOPE_TIME;
    const parsedDate = new Date(`${date}T12:00:00`);    

    // Get user profile for birth chart and location
    const userProfile = await this.userProfilesService.findByFirebaseUid(userId);
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    if (!userProfile.astrology) {
      throw new ForbiddenException('User must complete astrology profile first');
    }

    if (!userProfile.birthLocation) {
      throw new ForbiddenException('User birth location required for personalized horoscopes');
    }

    // Use provided timezone or fall back to user's birth location timezone
    const effectiveTimezone = timezone || userProfile.birthLocation.timezone.name;
    const coordinates = this.timezoneCoordsService.getCoordinatesForTimezone(effectiveTimezone);

    // Check for existing personal horoscope
    const existing = await this.findExistingPersonal(userId, parsedDate, effectiveTime);
    if (existing) {
      logger.debug('Returning existing personal horoscope', {
        userId,
        date,
        time: effectiveTime
      }, 'HoroscopesService');
      return this.transformToInterface(existing);
    }

    // Calculate new personal horoscope
    logger.info('Calculating new personal horoscope', {
      userId,
      date,
      time: effectiveTime,
      timezone: effectiveTimezone
    }, 'HoroscopesService');

    const newHoroscope = await this.calculatePersonalHoroscope(
      userId,
      userProfile.astrology,
      parsedDate,
      effectiveTime,
      effectiveTimezone,
      coordinates
    );

    return this.transformToInterface(newHoroscope);
  }

  private async findExistingPersonal(
    userId: string,
    date: Date,
    time: string
  ): Promise<HoroscopeDocument | null> {
    return this.horoscopeModel.findOne({
      userId,
      date,
      time
    }).exec();
  }

  private async calculatePersonalHoroscope(
    userId: string,
    userBirthChart: any, // AstrologyCalculated from user profile
    date: Date,
    time: string,
    timezone: string,
    coordinates: { lat: number; lng: number }
  ): Promise<HoroscopeDocument> {
    try {
      // 1. Calculate today's cosmic energy chart (all 5 planets)
      const cosmicAstrology = await this.astrologyService.calculateCoreAstrology(
        date,
        time,
        timezone,
        coordinates
      );

      // 2. Calculate cosmic chart total score (how well cosmic planets work together)
      const cosmicChart = await this.calculateCosmicTotalScore(cosmicAstrology);

      // 3. Calculate personal chart with cosmic-natal interactions for each planet
      const personalChart = await this.calculateCosmicNatalPlanetScores(
        cosmicAstrology,
        userBirthChart
      );

      // 4. Generate AI summary for the personal chart
      const personalChartWithSummary = await this.openAiHoroscopeService.generatePersonalDailySummary(
        userId,
        personalChart,
        [],
        date
      );

      const astronomicalEvents = await this.astronomicalEventsService.getDailyAstronomicalEvents(date, coordinates, timezone);      

      // 5. Store personal horoscope
      const horoscopeData = {
        userId,
        date,
        time,
        timezone,
        coordinates,
        personalChart: personalChartWithSummary,
        cosmicChart: cosmicChart,
        astronomicalEvents
      };

      const newHoroscope = new this.horoscopeModel(horoscopeData);
      return await newHoroscope.save();

    } catch (error) {
      logger.error('Failed to calculate personal horoscope', {
        userId,
        date: date.toISOString(),
        time,
        timezone,
        error
      }, 'HoroscopeService');
      throw error;
    }
  }

  /**
   * Calculate cosmic vs natal compatibility for each planet
   * This is the KEY FIX - each planet gets scored based on cosmic vs natal interaction
   */
  private async calculateCosmicNatalPlanetScores(
    cosmicAstrology: CoreAstrology,
    userBirthChart: any
  ) {
    const planets: PlanetType[] = ['Sun', 'Moon', 'Rising', 'Venus', 'Mars'];
    const weights = { Sun: 5, Moon: 4, Rising: 3, Venus: 2, Mars: 2 };
    
    const planetScores: any = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const planet of planets) {
      const cosmicSign = this.getCosmicSign(cosmicAstrology, planet);
      const natalSign = userBirthChart[planet.toLowerCase()].sign;
      
      // Use the same compatibility calculation as relationships
      const compatibility = await this.calculateSignCompatibility(cosmicSign, natalSign);
      
      planetScores[planet.toLowerCase()] = {
        sign: natalSign, // Keep natal sign (user's birth sign)
        degreesInSign: userBirthChart[planet.toLowerCase()].degreesInSign,
        absoluteDegrees: userBirthChart[planet.toLowerCase()].absoluteDegrees,
        totalScore: Math.round(compatibility.totalScore * 100) / 100,
        interactions: {
          // Could add cosmic breakdown here if needed
          cosmic: {
            score: compatibility.totalScore,
            description: `Today's cosmic ${cosmicSign} energy interacts with your natal ${natalSign} ${planet}`
          }
        }
      };
      
      totalWeightedScore += compatibility.totalScore * weights[planet];
      totalWeight += weights[planet];
    }

    return {
      ...planetScores,
      totalScore: Math.round((totalWeightedScore / totalWeight) * 100) / 100,
      createdAt: new Date(),
      lastCalculatedAt: new Date()
    };
  }

  /**
   * Extract cosmic planet sign from CoreAstrology
   */
  private getCosmicSign(cosmicAstrology: CoreAstrology, planet: PlanetType): ZodiacSignType {
    switch (planet) {
      case 'Sun': return cosmicAstrology.sunSign;
      case 'Moon': return cosmicAstrology.moonSign;
      case 'Rising': return cosmicAstrology.risingSign;
      case 'Venus': return cosmicAstrology.venusSign || 'Aries'; // Fallback
      case 'Mars': return cosmicAstrology.marsSign || 'Aries'; // Fallback
      default: throw new Error(`Unknown planet: ${planet}`);
    }
  }

  /**
   * Calculate sign-to-sign compatibility using the same engine as relationships
   */
  private async calculateSignCompatibility(cosmicSign: ZodiacSignType, natalSign: ZodiacSignType) {
    // Get sign data for both signs (same as relationships page)
    const [cosmicSignData, natalSignData] = await Promise.all([
      this.signsService.findByName(cosmicSign),
      this.signsService.findByName(natalSign)
    ]);

    if (!cosmicSignData || !natalSignData) {
      logger.warn('Missing sign data for compatibility calculation', {
        cosmicSign,
        natalSign,
        hasCosmicData: !!cosmicSignData,
        hasNatalData: !!natalSignData
      }, 'HoroscopesService');
      return { totalScore: 0 }; // Neutral score if data missing
    }

    // Use the exact same calculation as relationships
    return calculateCompatibility(cosmicSignData, natalSignData);
  }

  /**
   * Calculate the cosmic chart's internal compatibility (how well cosmic planets work together)
   * @param cosmicAstrology - Raw cosmic planetary positions
   * @returns AstrologyCalculated with totalScore representing cosmic energy quality
   */
  private async calculateCosmicTotalScore(cosmicAstrology: CoreAstrology) {
    // Create signs record for cosmic planets
    const cosmicSigns: Record<PlanetType, ZodiacSignType> = {
      Sun: cosmicAstrology.sunSign,
      Moon: cosmicAstrology.moonSign,
      Rising: cosmicAstrology.risingSign,
      Venus: cosmicAstrology.venusSign || 'Aries', // Fallback if not calculated
      Mars: cosmicAstrology.marsSign || 'Aries'
    };

    // Create positions record for cosmic planets
    const cosmicPositions = {
      Sun: cosmicAstrology.sunPosition,
      Moon: cosmicAstrology.moonPosition,
      Rising: cosmicAstrology.risingPosition,
      Venus: cosmicAstrology.venusPosition || { sign: 'Aries' as ZodiacSignType, degreesInSign: 0, absoluteDegrees: 0 },
      Mars: cosmicAstrology.marsPosition || { sign: 'Aries' as ZodiacSignType, degreesInSign: 0, absoluteDegrees: 0 }
    };

    // Use existing astrology data service to calculate cosmic chart
    return await this.astrologyDataService.calculateUserAstrologyData(
      cosmicSigns,
      cosmicPositions
    );
  }

  private transformToInterface(doc: HoroscopeDocument): Horoscope {
    return {
      _id: doc._id?.toString(),
      userId: doc.userId,
      date: doc.date,
      time: doc.time,
      timezone: doc.timezone,
      coordinates: doc.coordinates,
      personalChart: JSON.parse(JSON.stringify(doc.personalChart)),
      cosmicChart: JSON.parse(JSON.stringify(doc.cosmicChart)),
      astronomicalEvents: doc.astronomicalEvents as DailyAstronomicalEvents,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}