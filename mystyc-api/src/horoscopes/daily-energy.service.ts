import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import { DailyEnergyRangeResponse, DailyEnergy } from 'mystyc-common/interfaces/horoscope.interface';
import { AstrologyCalculated } from 'mystyc-common/interfaces/astrology.interface';
import { PlanetType, ZodiacSignType } from 'mystyc-common/schemas';

import { logger } from '@/common/util/logger';
import { AstrologyService, CoreAstrology } from '@/astrology/services/astrology.service';
import { AstrologyDataService } from '@/astrology/services/astrology-data.service';
import { UserProfilesService } from '@/users/user-profiles.service';
import { TimezoneCoordsService } from './timezone-coords.service';
import { CosmicNatalCompatibilityService } from './cosmic-natal-compatibility.service';

@Injectable()
export class DailyEnergyService {
  protected DEFAULT_TIME = '8:00';

  constructor(
    private readonly astrologyService: AstrologyService,
    private readonly astrologyDataService: AstrologyDataService,
    private readonly userProfilesService: UserProfilesService,
    private readonly timezoneCoordsService: TimezoneCoordsService,
    private readonly cosmicNatalCompatibilityService: CosmicNatalCompatibilityService,
  ) {}

  async getDailyEnergyRange(
    userId: string,
    startDate: string,
    time?: string,
    timezone?: string
  ): Promise<DailyEnergyRangeResponse> {
    const effectiveTime = time || this.DEFAULT_TIME;
    const parsedStartDate = new Date(startDate);

    // Get user profile for birth chart and location
    const userProfile = await this.userProfilesService.findByFirebaseUid(userId);
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    if (!userProfile.astrology) {
      throw new ForbiddenException('User must complete astrology profile first');
    }

    if (!userProfile.birthLocation) {
      throw new ForbiddenException('User birth location required for personalized energy range');
    }

    // Use provided timezone or fall back to user's birth location timezone
    const effectiveTimezone = timezone || userProfile.birthLocation.timezone.name;
    const coordinates = this.timezoneCoordsService.getCoordinatesForTimezone(effectiveTimezone);

    const days: DailyEnergy[] = [];
    
    logger.info('Calculating daily energy range', {
      userId,
      startDate,
      effectiveTime,
      effectiveTimezone
    }, 'DailyEnergyService');

    // Calculate energy for 7 days starting from startDate
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(parsedStartDate);
      currentDate.setDate(parsedStartDate.getDate() + i);

      try {
        // Calculate cosmic energy for this day (all 5 planets)
        const cosmicAstrology = await this.astrologyService.calculateCoreAstrology(
          currentDate,
          effectiveTime,
          effectiveTimezone,
          coordinates
          // Use default (all planets) for complete cosmic chart
        );

        // Calculate cosmic total score (how well do cosmic planets work together)
        const cosmicChart = await this.calculateCosmicTotalScore(cosmicAstrology);
        const cosmicTotalScore = cosmicChart.totalScore;

        // Calculate personal score (how does cosmic energy work with user's birth chart)
        const personalTotalScore = await this.cosmicNatalCompatibilityService
          .calculateCosmicNatalCompatibility(cosmicAstrology, userProfile.astrology);

        days.push({
          date: currentDate.toISOString().split('T')[0], // "2025-01-13"
          cosmicTotalScore: Math.round(cosmicTotalScore * 100) / 100,
          personalTotalScore: Math.round(personalTotalScore * 100) / 100
        });

        logger.debug('Daily energy calculated', {
          date: currentDate.toISOString().split('T')[0],
          cosmicScore: cosmicTotalScore,
          personalScore: personalTotalScore
        }, 'DailyEnergyService');

      } catch (error) {
        logger.error('Failed to calculate daily energy for date', {
          userId,
          date: currentDate.toISOString().split('T')[0],
          error
        }, 'DailyEnergyService');
        throw error;
      }
    }

    const endDate = new Date(parsedStartDate);
    endDate.setDate(parsedStartDate.getDate() + 6);

    const response = {
      startDate: parsedStartDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      days
    };

    logger.info('Daily energy range calculated successfully', {
      userId,
      daysCalculated: days.length
    }, 'DailyEnergyService');

    return response;
  }

  /**
   * Calculate the cosmic chart's internal compatibility (how well cosmic planets work together)
   * @param cosmicAstrology - Raw cosmic planetary positions
   * @returns AstrologyCalculated with totalScore representing cosmic energy quality
   */
  private async calculateCosmicTotalScore(cosmicAstrology: CoreAstrology): Promise<AstrologyCalculated> {
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
}