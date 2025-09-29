import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import { DailyEnergyRangeResponse, DailyEnergy, PlanetaryDayData } from 'mystyc-common/interfaces/horoscope.interface';
import { AstrologyCalculated } from 'mystyc-common/interfaces/astrology.interface';
import { PlanetType, ZodiacSignType } from 'mystyc-common/schemas';
import { MonthlyAstronomicalSummary } from 'mystyc-common/interfaces';
import { AstronomicalEventsService } from './astronomical-events.service';

import { logger } from '@/common/util/logger';
import { AstrologyService, CoreAstrology } from '@/astrology/services/astrology.service';
import { AstrologyDataService } from '@/astrology/services/astrology-data.service';
import { UserProfilesService } from '@/users/user-profiles.service';
import { TimezoneCoordsService } from './timezone-coords.service';
import { CosmicNatalCompatibilityService } from './cosmic-natal-compatibility.service';

// Planetary importance weights (same as in CosmicNatalCompatibilityService)
const PLANETARY_IMPORTANCE: Record<PlanetType, number> = {
  Sun: 5,
  Moon: 4,
  Rising: 3,
  Venus: 2,
  Mars: 2
};

@Injectable()
export class DailyEnergyService {
  protected DEFAULT_TIME = '8:00';

  constructor(
    private readonly astrologyService: AstrologyService,
    private readonly astrologyDataService: AstrologyDataService,
    private readonly astronomicalEventsService: AstronomicalEventsService,
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

    // Parse the date in the user's timezone context
    // This ensures "2025-01-13" means Jan 13th in THEIR timezone, not server timezone
    const parsedStartDate = new Date(`${startDate}T12:00:00`); // Use noon to avoid DST issues
    
    const days: DailyEnergy[] = [];
    
    logger.info('Calculating daily energy range', {
      userId,
      startDate,
      effectiveTime,
      effectiveTimezone,
      parsedDate: parsedStartDate.toISOString()
    }, 'DailyEnergyService');

    // Calculate energy for 7 days starting from startDate
    for (let i = 0; i < 7; i++) {
      // Create date in user's timezone context
      const currentDate = new Date(parsedStartDate);
      currentDate.setDate(parsedStartDate.getDate() + i);

      const userLocalDate = new Date(currentDate.toLocaleString('en-US', { timeZone: effectiveTimezone }));      

      try {
        // Calculate cosmic energy for this day (all 5 planets)
        const cosmicAstrology = await this.astrologyService.calculateCoreAstrology(
          userLocalDate,
          effectiveTime,
          effectiveTimezone,
          coordinates
          // Use default (all planets) for complete cosmic chart
        );

        // Calculate cosmic total score (how well do cosmic planets work together)
        const cosmicChart = await this.calculateCosmicTotalScore(cosmicAstrology);
        const cosmicTotalScore = cosmicChart.totalScore;

        // Calculate detailed personal score (how does cosmic energy work with user's birth chart)
        const personalCompatibility = await this.cosmicNatalCompatibilityService
          .calculateCosmicNatalCompatibilityDetailed(cosmicAstrology, userProfile.astrology);

        // Extract planetary data for detailed response
        const planets = this.extractPlanetaryData(cosmicAstrology, cosmicChart, personalCompatibility.planetaryScores);

        days.push({
          date: userLocalDate.toISOString().split('T')[0], // "2025-01-13"
          cosmicTotalScore: Math.round(cosmicTotalScore * 100) / 100,
          personalTotalScore: Math.round(personalCompatibility.totalScore * 100) / 100,
          planets
        });

        logger.debug('Daily energy calculated', {
          date: userLocalDate.toISOString().split('T')[0],
          cosmicScore: cosmicTotalScore,
          personalScore: personalCompatibility.totalScore
        }, 'DailyEnergyService');

      } catch (error) {
        logger.error('Failed to calculate daily energy for date', {
          userId,
          date: userLocalDate.toISOString().split('T')[0],
          error
        }, 'DailyEnergyService');
        throw error;
      }
    }

    const monthlyAstronomicalSummary = await this.astronomicalEventsService.getMonthlyAstronomicalSummary(parsedStartDate, coordinates, effectiveTimezone);

    const endDate = new Date(parsedStartDate);
    endDate.setDate(parsedStartDate.getDate() + 6);

    const cosmicScoreTotal = days.length > 0 
      ? Math.round((days.reduce((sum, day) => sum + day.cosmicTotalScore, 0) / days.length) * 100) / 100
      : 0;

    const personalScoreTotal = days.length > 0
      ? Math.round((days.reduce((sum, day) => sum + day.personalTotalScore, 0) / days.length) * 100) / 100  
      : 0;

    const response = {
      startDate: parsedStartDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      days,
      cosmicScoreTotal,
      personalScoreTotal,
      monthlyAstronomicalSummary
    };

    logger.info('Daily energy range calculated successfully', {
      userId,
      daysCalculated: days.length
    }, 'DailyEnergyService');

    return response;
  }

  /**
   * Extract planetary data for the enhanced daily energy response
   * @param cosmicAstrology - Raw cosmic planetary positions and signs
   * @param cosmicChart - Calculated cosmic chart with interactions
   * @param personalScores - Individual cosmic-natal compatibility scores
   * @returns Structured planetary data for the response
   */
  private extractPlanetaryData(
    cosmicAstrology: CoreAstrology,
    cosmicChart: AstrologyCalculated,
    personalScores: { sun: number; moon: number; rising: number; venus: number; mars: number }
  ): DailyEnergy['planets'] {
    return {
      sun: this.buildPlanetaryDayData('Sun', cosmicAstrology.sunSign, cosmicChart.sun, personalScores.sun),
      moon: this.buildPlanetaryDayData('Moon', cosmicAstrology.moonSign, cosmicChart.moon, personalScores.moon),
      rising: this.buildPlanetaryDayData('Rising', cosmicAstrology.risingSign, cosmicChart.rising, personalScores.rising),
      venus: this.buildPlanetaryDayData('Venus', cosmicAstrology.venusSign || 'Aries', cosmicChart.venus, personalScores.venus),
      mars: this.buildPlanetaryDayData('Mars', cosmicAstrology.marsSign || 'Aries', cosmicChart.mars, personalScores.mars)
    };
  }

  /**
   * Build planetary day data for a single planet
   * @param planetType - The planet type (for logging/weights)
   * @param sign - The zodiac sign the planet is in
   * @param planetData - The calculated planetary data from cosmic chart
   * @param personalScore - How this cosmic planet interacts with user's birth chart
   * @returns Complete planetary day data
   */
  private buildPlanetaryDayData(
    planetType: PlanetType,
    sign: ZodiacSignType,
    planetData: AstrologyCalculated['sun'], // All planets have same structure
    personalScore: number
  ): PlanetaryDayData {
    // Calculate cosmicScore as weighted average of interactions
    const interactions = planetData.interactions || {};
    const cosmicScore = this.calculateCosmicScore(interactions);

    return {
      sign,
      personalScore: Math.round(personalScore * 100) / 100,
      cosmicScore: Math.round(cosmicScore * 100) / 100,
      interactions: {
        sun: interactions.sun?.score,
        moon: interactions.moon?.score,
        rising: interactions.rising?.score,
        venus: interactions.venus?.score,
        mars: interactions.mars?.score
      }
    };
  }

  /**
   * Calculate cosmic score as weighted average of planetary interactions
   * @param interactions - Raw interaction scores for this planet
   * @returns Weighted average cosmic score (-1 to 1)
   */
  private calculateCosmicScore(interactions: Record<string, { score: number }>): number {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    // Weight each interaction by the target planet's importance
    for (const [planetName, interaction] of Object.entries(interactions)) {
      const planetType = this.getPlanetTypeFromName(planetName);
      if (planetType && PLANETARY_IMPORTANCE[planetType]) {
        const weight = PLANETARY_IMPORTANCE[planetType];
        totalWeightedScore += interaction.score * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  }

  /**
   * Convert planet name string to PlanetType enum
   * @param planetName - Planet name as string (lowercase)
   * @returns PlanetType or null if not found
   */
  private getPlanetTypeFromName(planetName: string): PlanetType | null {
    const nameMap: Record<string, PlanetType> = {
      'sun': 'Sun',
      'moon': 'Moon', 
      'rising': 'Rising',
      'venus': 'Venus',
      'mars': 'Mars'
    };
    
    return nameMap[planetName.toLowerCase()] || null;
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