import { Injectable } from '@nestjs/common';

import { AstrologyCalculated } from 'mystyc-common/interfaces/astrology.interface';
import { PlanetType, ZodiacSignType } from 'mystyc-common/schemas';
import { calculateCompatibility } from 'mystyc-common/util/astrology-calculations';

import { logger } from '@/common/util/logger';
import { CoreAstrology } from '@/astrology/services/astrology.service';
import { SignsService } from '@/astrology/services/signs.service';

// Planetary importance weights
const PLANETARY_IMPORTANCE: Record<PlanetType, number> = {
  Sun: 5,
  Moon: 4,
  Rising: 3,
  Venus: 2,
  Mars: 2
};

export interface CosmicNatalCompatibilityResult {
  totalScore: number;
  planetaryScores: {
    sun: number;
    moon: number;
    rising: number;
    venus: number;
    mars: number;
  };
}

@Injectable()
export class CosmicNatalCompatibilityService {
  constructor(
    private readonly signsService: SignsService,
  ) {}

  /**
   * Calculate compatibility between cosmic chart and natal chart
   * @param cosmicChart - Today's cosmic planetary positions
   * @param natalChart - User's birth chart 
   * @param planets - Which planets to include in calculation
   * @returns Detailed compatibility with individual planetary scores
   */
  async calculateCosmicNatalCompatibility(
    cosmicChart: CoreAstrology,
    natalChart: AstrologyCalculated,
    planets: PlanetType[] = ['Sun', 'Moon', 'Rising', 'Venus', 'Mars']
  ): Promise<number> {
    logger.debug('Calculating cosmic-natal compatibility', {
      cosmicSigns: {
        sun: cosmicChart.sunSign,
        moon: cosmicChart.moonSign,
        rising: cosmicChart.risingSign,
        venus: cosmicChart.venusSign,
        mars: cosmicChart.marsSign
      },
      natalSigns: {
        sun: natalChart.sun.sign,
        moon: natalChart.moon.sign,
        rising: natalChart.rising.sign,
        venus: natalChart.venus.sign,
        mars: natalChart.mars.sign
      },
      planetsIncluded: planets
    }, 'CosmicNatalCompatibilityService');

    let totalWeightedScore = 0;
    let totalWeight = 0;

    // Calculate compatibility for each planet
    for (const planet of planets) {
      try {
        const cosmicSign = this.getCosmicPlanetSign(cosmicChart, planet);
        const natalSign = this.getNatalPlanetSign(natalChart, planet);
        const weight = PLANETARY_IMPORTANCE[planet];

        if (cosmicSign && natalSign) {
          const compatibility = await this.getPlanetCompatibilityScore(
            cosmicSign, 
            natalSign, 
            planet
          );

          totalWeightedScore += compatibility * weight;
          totalWeight += weight;

          logger.debug('Planet compatibility calculated', {
            planet,
            cosmicSign,
            natalSign,
            compatibility,
            weight,
            weightedScore: compatibility * weight
          }, 'CosmicNatalCompatibilityService');
        } else {
          logger.warn('Missing sign data for planet', {
            planet,
            cosmicSign,
            natalSign
          }, 'CosmicNatalCompatibilityService');
        }

      } catch (error) {
        logger.error('Failed to calculate planet compatibility', {
          planet,
          error
        }, 'CosmicNatalCompatibilityService');
        // Continue with other planets instead of failing completely
      }
    }

    const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    logger.info('Cosmic-natal compatibility calculated', {
      totalWeightedScore,
      totalWeight,
      finalScore,
      planetsCalculated: planets.length
    }, 'CosmicNatalCompatibilityService');

    return Math.round(finalScore * 100) / 100; // Round to 2 decimals
  }

  /**
   * Calculate detailed compatibility between cosmic chart and natal chart
   * @param cosmicChart - Today's cosmic planetary positions
   * @param natalChart - User's birth chart 
   * @param planets - Which planets to include in calculation
   * @returns Detailed compatibility with individual planetary scores and total
   */
  async calculateCosmicNatalCompatibilityDetailed(
    cosmicChart: CoreAstrology,
    natalChart: AstrologyCalculated,
    planets: PlanetType[] = ['Sun', 'Moon', 'Rising', 'Venus', 'Mars']
  ): Promise<CosmicNatalCompatibilityResult> {
    logger.debug('Calculating detailed cosmic-natal compatibility', {
      cosmicSigns: {
        sun: cosmicChart.sunSign,
        moon: cosmicChart.moonSign,
        rising: cosmicChart.risingSign,
        venus: cosmicChart.venusSign,
        mars: cosmicChart.marsSign
      },
      natalSigns: {
        sun: natalChart.sun.sign,
        moon: natalChart.moon.sign,
        rising: natalChart.rising.sign,
        venus: natalChart.venus.sign,
        mars: natalChart.mars.sign
      },
      planetsIncluded: planets
    }, 'CosmicNatalCompatibilityService');

    let totalWeightedScore = 0;
    let totalWeight = 0;
    const planetaryScores: CosmicNatalCompatibilityResult['planetaryScores'] = {
      sun: 0,
      moon: 0,
      rising: 0,
      venus: 0,
      mars: 0
    };

    // Calculate compatibility for each planet
    for (const planet of planets) {
      try {
        const cosmicSign = this.getCosmicPlanetSign(cosmicChart, planet);
        const natalSign = this.getNatalPlanetSign(natalChart, planet);
        const weight = PLANETARY_IMPORTANCE[planet];

        if (cosmicSign && natalSign) {
          const compatibility = await this.getPlanetCompatibilityScore(
            cosmicSign, 
            natalSign, 
            planet
          );

          // Store individual score
          planetaryScores[planet.toLowerCase() as keyof typeof planetaryScores] = Math.round(compatibility * 100) / 100;

          totalWeightedScore += compatibility * weight;
          totalWeight += weight;

          logger.debug('Planet compatibility calculated', {
            planet,
            cosmicSign,
            natalSign,
            compatibility,
            weight,
            weightedScore: compatibility * weight
          }, 'CosmicNatalCompatibilityService');
        } else {
          logger.warn('Missing sign data for planet', {
            planet,
            cosmicSign,
            natalSign
          }, 'CosmicNatalCompatibilityService');
        }
      } catch (error) {
        logger.error('Failed to calculate planet compatibility', {
          planet,
          error
        }, 'CosmicNatalCompatibilityService');
        // Continue with other planets instead of failing completely
      }
    }

    const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    logger.info('Detailed cosmic-natal compatibility calculated', {
      totalWeightedScore,
      totalWeight,
      finalScore,
      planetaryScores,
      planetsCalculated: planets.length
    }, 'CosmicNatalCompatibilityService');

    return {
      totalScore: Math.round(finalScore * 100) / 100,
      planetaryScores
    };
  }

  /**
   * Calculate compatibility score between two planet signs
   * @param cosmicSign - Cosmic planet's zodiac sign
   * @param natalSign - Natal planet's zodiac sign  
   * @param planet - Planet name for logging
   * @returns Compatibility score (-1 to 1)
   */
  private async getPlanetCompatibilityScore(
    cosmicSign: ZodiacSignType,
    natalSign: ZodiacSignType,
    planet: PlanetType
  ): Promise<number> {
    // Get sign data for both signs
    const [cosmicSignData, natalSignData] = await Promise.all([
      this.signsService.findByName(cosmicSign),
      this.signsService.findByName(natalSign)
    ]);

    if (!cosmicSignData || !natalSignData) {
      logger.warn('Missing sign data for compatibility calculation', {
        planet,
        cosmicSign,
        natalSign,
        hasCosmicData: !!cosmicSignData,
        hasNatalData: !!natalSignData
      }, 'CosmicNatalCompatibilityService');
      return 0; // Neutral score if data missing
    }

    // Use existing sign compatibility logic
    const compatibility = calculateCompatibility(cosmicSignData, natalSignData);

    logger.debug('Sign compatibility calculated', {
      planet,
      cosmicSign,
      natalSign,
      totalScore: compatibility.totalScore,
      elementScore: compatibility.elementScore,
      modalityScore: compatibility.modalityScore,
      polarityScore: compatibility.polarityScore,
      dynamic: compatibility.dynamic
    }, 'CosmicNatalCompatibilityService');

    return compatibility.totalScore;
  }

  /**
   * Extract cosmic planet sign from CoreAstrology
   */
  private getCosmicPlanetSign(cosmicChart: CoreAstrology, planet: PlanetType): ZodiacSignType | null {
    switch (planet) {
      case 'Sun': return cosmicChart.sunSign;
      case 'Moon': return cosmicChart.moonSign;
      case 'Rising': return cosmicChart.risingSign;
      case 'Venus': return cosmicChart.venusSign || null;
      case 'Mars': return cosmicChart.marsSign || null;
      default: return null;
    }
  }

  /**
   * Extract natal planet sign from AstrologyCalculated
   */
  private getNatalPlanetSign(natalChart: AstrologyCalculated, planet: PlanetType): ZodiacSignType | null {
    switch (planet) {
      case 'Sun': return natalChart.sun.sign;
      case 'Moon': return natalChart.moon.sign;
      case 'Rising': return natalChart.rising.sign;
      case 'Venus': return natalChart.venus.sign;
      case 'Mars': return natalChart.mars.sign;
      default: return null;
    }
  }
}