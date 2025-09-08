import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Horoscope } from 'mystyc-common/interfaces/horoscope.interface';
import { PlanetType, ZodiacSignType } from 'mystyc-common/schemas';

import { logger } from '@/common/util/logger';
import { AstrologyService, CoreAstrology } from '@/astrology/services/astrology.service';
import { AstrologyDataService } from '@/astrology/services/astrology-data.service';
import { UserProfilesService } from '@/users/user-profiles.service';
import { HoroscopeDocument } from './schemas/horoscope.schema';
import { TimezoneCoordsService } from './timezone-coords.service';
import { OpenAIHoroscopeService } from '../openai/openai-horoscope.service';
import { CosmicNatalCompatibilityService } from './cosmic-natal-compatibility.service';

@Injectable()
export class HoroscopesService {
  protected DEFAULT_HOROSCOPE_TIME = '8:00';

  constructor(
    @InjectModel('Horoscope') private horoscopeModel: Model<HoroscopeDocument>,
    private readonly astrologyService: AstrologyService,
    private readonly astrologyDataService: AstrologyDataService,
    private readonly userProfilesService: UserProfilesService,
    private readonly timezoneCoordsService: TimezoneCoordsService,
    private readonly openAiHoroscopeService: OpenAIHoroscopeService,
    private readonly cosmicNatalCompatibilityService: CosmicNatalCompatibilityService,
  ) {}

  async getOrCreatePersonalHoroscope(
    userId: string,
    date: string,
    time?: string,
    timezone?: string
  ): Promise<Horoscope> {
    const effectiveTime = time || this.DEFAULT_HOROSCOPE_TIME;
    const parsedDate = new Date(date);

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
        // Use default (all planets) for complete cosmic chart
      );

      // 2. Calculate cosmic chart total score (how well cosmic planets work together)
      const cosmicChart = await this.calculateCosmicTotalScore(cosmicAstrology);

      // 3. Calculate personal chart score (cosmic-natal compatibility)
      const personalTotalScore = await this.cosmicNatalCompatibilityService
        .calculateCosmicNatalCompatibility(cosmicAstrology, userBirthChart);

      // 4. Create personal chart object with new score
      const personalChart = {
        ...userBirthChart,
        totalScore: personalTotalScore,
        createdAt: new Date(),
        lastCalculatedAt: new Date()
      };

      // 5. Generate AI summary for the personal chart
      const personalChartWithSummary = await this.openAiHoroscopeService.generatePersonalDailySummary(
        userId,
        personalChart,
        [], // No influences array needed with new approach
        date
      );

      // 6. Store personal horoscope
      const horoscopeData = {
        userId,
        date,
        time,
        timezone,
        coordinates,
        personalChart: personalChartWithSummary,
        cosmicChart: cosmicChart
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
      }, 'HoroscapeService');
      throw error;
    }
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
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}