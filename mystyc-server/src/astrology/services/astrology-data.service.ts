import { Injectable } from '@nestjs/common';

import { 
  Sign, 
  PlanetType, 
  ZodiacSignType,
} from 'mystyc-common/schemas';
import { AstrologyCalculated, AstrologyComplete, PlanetaryDegrees, PlanetaryData, PlanetaryCompleteData } from 'mystyc-common/interfaces/astrology.interface';
import { calculatePlanetaryInteractions } from 'mystyc-common/util/astrology-calculations';

import { logger } from '@/common/util/logger';
import { SignsService } from './signs.service';
import { PlanetsService } from './planets.service';
import { DynamicsService } from './dynamics.service';
import { EnergyTypesService } from './energy-types.service';
import { PlanetaryPositionsService } from './planetary-positions.service';
import { PlanetInteractionsService } from './planet-interactions.service';
import { SignInteractionsService } from './sign-interactions.service';

@Injectable()
export class AstrologyDataService {
  constructor(
    private readonly signsService: SignsService,
    private readonly planetsService: PlanetsService,
    private readonly dynamicsService: DynamicsService,
    private readonly energyTypesService: EnergyTypesService,
    private readonly planetaryPositionsService: PlanetaryPositionsService,
    private readonly planetInteractionsService: PlanetInteractionsService,
    private readonly signInteractionsService: SignInteractionsService,
  ) {}

  /**
   * Calculates user-specific astrology data with planetary interaction scores
   * @param signs - Record mapping planets to their zodiac signs
   * @returns Promise<AstrologyCalculated> - Calculated astrology data with planetary interaction scores
   */
  async calculateUserAstrologyData(
    signs: Record<PlanetType, ZodiacSignType>,
    positions?: Record<PlanetType, PlanetaryDegrees> 
  ): Promise<AstrologyCalculated> {
    logger.info('Calculating user astrology data', { signs }, 'AstrologyDataService');

    try {
      // Get sign data for all user signs
      const uniqueSigns = [...new Set(Object.values(signs))];
      const signDataMap = new Map<ZodiacSignType, Sign>();
      
      const signDataPromises = uniqueSigns.map(async (sign) => {
        const signInfo = await this.signsService.findByName(sign);
        if (signInfo) signDataMap.set(sign, signInfo);
        return signInfo;
      });
      
      await Promise.all(signDataPromises);
      const signData = Object.fromEntries(signDataMap) as Record<ZodiacSignType, Sign>;

      // Verify we have all required sign data
      for (const sign of uniqueSigns) {
        if (!signData[sign]) {
          throw new Error(`Missing sign data for: ${sign}`);
        }
      }

      // Calculate planetary interactions
      const calculations = calculatePlanetaryInteractions(signs, signData, positions);

      const now = new Date();
      const astrologyData: AstrologyCalculated = {
        sun: {
          sign: signs.Sun,
          degreesInSign: positions?.Sun?.degreesInSign,      // NEW
          absoluteDegrees: positions?.Sun?.absoluteDegrees,  // NEW
          totalScore: calculations.sun.totalScore,
          interactions: calculations.sun.interactions
        },
        moon: {
          sign: signs.Moon,
          degreesInSign: positions?.Moon?.degreesInSign,     // NEW
          absoluteDegrees: positions?.Moon?.absoluteDegrees, // NEW
          totalScore: calculations.moon.totalScore,
          interactions: calculations.moon.interactions
        },
        rising: {
          sign: signs.Rising,
          degreesInSign: positions?.Rising?.degreesInSign,     // NEW
          absoluteDegrees: positions?.Rising?.absoluteDegrees, // NEW
          totalScore: calculations.rising.totalScore,
          interactions: calculations.rising.interactions
        },
        venus: {
          sign: signs.Venus,
          degreesInSign: positions?.Venus?.degreesInSign,     // NEW
          absoluteDegrees: positions?.Venus?.absoluteDegrees, // NEW
          totalScore: calculations.venus.totalScore,
          interactions: calculations.venus.interactions
        },
        mars: {
          sign: signs.Mars,
          degreesInSign: positions?.Mars?.degreesInSign,     // NEW
          absoluteDegrees: positions?.Mars?.absoluteDegrees, // NEW
          totalScore: calculations.mars.totalScore,
          interactions: calculations.mars.interactions
        },
        totalScore: calculations.totalScore,
        createdAt: now,
        lastCalculatedAt: now
      };
        
      logger.info('User astrology data calculated successfully', {
        planetsCalculated: Object.keys(calculations).length,
        sunTotalScore: calculations.sun.totalScore,
        moonTotalScore: calculations.moon.totalScore
      }, 'AstrologyDataService');

      return astrologyData;
      
    } catch (error) {
      logger.error('Failed to calculate user astrology data', { signs, error }, 'AstrologyDataService');
      throw error;
    }
  }

  /**
   * Assembles complete astrology data with rich reference information
   * @param calculatedData - Base calculated astrology data with scores
   * @returns Promise<AstrologyComplete> - Complete astrology data with full reference information
   */
  async assembleCompleteAstrologyData(calculatedData: AstrologyCalculated): Promise<AstrologyComplete> {
    logger.info('Assembling complete astrology data', {}, 'AstrologyDataService');

    try {
      // Build complete data for each planet in parallel
      const [sunComplete, moonComplete, risingComplete, venusComplete, marsComplete] = await Promise.all([
        this.buildPlanetaryCompleteData('Sun', calculatedData.sun),
        this.buildPlanetaryCompleteData('Moon', calculatedData.moon),
        this.buildPlanetaryCompleteData('Rising', calculatedData.rising),
        this.buildPlanetaryCompleteData('Venus', calculatedData.venus),
        this.buildPlanetaryCompleteData('Mars', calculatedData.mars),
      ]);

      // Build all planetary interactions
      const planetaryInteractions = await this.buildAllPlanetaryInteractions();

      const completeData: AstrologyComplete = {
        totalScore: calculatedData.totalScore,
        sun: sunComplete,
        moon: moonComplete,
        rising: risingComplete,
        venus: venusComplete,
        mars: marsComplete,
        planetaryInteractions,
        createdAt: calculatedData.createdAt,
        lastCalculatedAt: calculatedData.lastCalculatedAt
      };

      logger.info('Complete astrology data assembled successfully', {}, 'AstrologyDataService');
      return completeData;

    } catch (error) {
      logger.error('Failed to assemble complete astrology data', { error }, 'AstrologyDataService');
      throw error;
    }
  }  

  /**
   * Builds complete data for a single planet
   */
  private async buildPlanetaryCompleteData(
    planetType: string, 
    calculatedPlanet: PlanetaryData
  ): Promise<PlanetaryCompleteData> {
    // Use existing SignInteractionsService method instead of duplicating
    const signComplete = await this.signInteractionsService.buildCompleteSignData(calculatedPlanet.sign);

    const planet = await this.planetsService.findByName(planetType as PlanetType);
    
    const positionData = await this.planetaryPositionsService.findByPosition(planetType as PlanetType, calculatedPlanet.sign);

    let positionComplete = null;
    if (positionData && signComplete) {
      const energyTypeData = await this.energyTypesService.findByName(positionData.energyType);
      positionComplete = {
        ...positionData,
        signData: signComplete,
        energyTypeData
      };
    }

    return {
      sign: calculatedPlanet.sign,
      totalScore: calculatedPlanet.totalScore,
      interactions: calculatedPlanet.interactions || {},
      signData: signComplete,
      positionData: positionComplete!,
      planetData: planet!,
    };
  }

  /**
   * Builds all planetary interactions with complete data
   */
  private async buildAllPlanetaryInteractions(): Promise<AstrologyComplete['planetaryInteractions']> {
    const interactions = {} as AstrologyComplete['planetaryInteractions'];
    const planetCombinations = [
      ['Sun', 'Moon'], ['Sun', 'Rising'], ['Sun', 'Mars'], ['Sun', 'Venus'],
      ['Moon', 'Rising'], ['Moon', 'Venus'], ['Moon', 'Mars'],
      ['Rising', 'Venus'], ['Rising', 'Mars'], ['Venus', 'Mars']
    ];

    await Promise.all(
      planetCombinations.map(async ([p1, p2]) => {
        const key = `${p1.toLowerCase()}-${p2.toLowerCase()}` as keyof AstrologyComplete['planetaryInteractions'];
        const interaction = await this.planetInteractionsService.findByPlanets(p1 as PlanetType, p2 as PlanetType);
        
        if (interaction) {
          const [dynamicData, energyTypeData] = await Promise.all([
            this.dynamicsService.findByName(interaction.dynamic),
            this.energyTypesService.findByName(interaction.energyType)
          ]);
          
          interactions[key] = {
            ...interaction,
            dynamicData,
            energyTypeData
          } as any;
        }
      })
    );

    return interactions;
  }  
}