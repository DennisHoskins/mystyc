import { Injectable } from '@nestjs/common';

import { 
  UserAstrologyData, 
  REQUIRED_PLANET_INTERACTIONS, 
  createInteractionKey 
} from 'mystyc-common/schemas/astrology.schema';
import { 
  Sign, 
  PlanetType, 
  ZodiacSignType,
  PlanetInteraction,
  ElementInteraction,
  ModalityInteraction
} from 'mystyc-common/schemas';

import { logger } from '@/common/util/logger';
import { SignsService } from './signs.service';
import { PlanetaryPositionsService } from './planetary-positions.service';
import { PlanetInteractionsService } from './planet-interactions.service';
import { ElementInteractionsService } from './element-interactions.service';
import { ModalityInteractionsService } from './modality-interactions.service';

@Injectable()
export class AstrologyDataService {
  constructor(
    private readonly signsService: SignsService,
    private readonly planetaryPositionsService: PlanetaryPositionsService,
    private readonly planetInteractionsService: PlanetInteractionsService,
    private readonly elementInteractionsService: ElementInteractionsService,
    private readonly modalityInteractionsService: ModalityInteractionsService,
  ) {}

  /**
   * Assembles complete astrology data from a set of planetary signs
   * @param signs - Record mapping planets to their zodiac signs
   * @returns Promise<UserAstrologyData> - Complete astrology data with planetary positions and interactions
   */
  async assembleAstrologyData(signs: Record<PlanetType, ZodiacSignType>): Promise<UserAstrologyData> {
    logger.info('Assembling astrology data', { signs }, 'AstrologyDataService');

    try {
      // Get all unique signs for batching
      const uniqueSigns = [...new Set(Object.values(signs))];
      
      // Batch fetch all sign information  
      const signInfoMap = await this.fetchAllSignInfo(uniqueSigns);

      // Build planetary data
      const planetaryData = await this.buildPlanetaryData(signs, signInfoMap);

      // Get all required interactions
      const interactions = await this.fetchAllInteractions(signInfoMap);

      logger.info('Astrology data assembled successfully', { 
        planetsCount: Object.keys(planetaryData).length,
        planetInteractionsCount: Object.keys(interactions.planets).length,
        elementInteractionsCount: Object.keys(interactions.elements).length,
        modalityInteractionsCount: Object.keys(interactions.modalities).length
      }, 'AstrologyDataService');

      return { planetaryData, interactions };
      
    } catch (error) {
      logger.error('Failed to assemble astrology data', {
        signs,
        error
      }, 'AstrologyDataService');
      
      throw error;
    }
  }

  private async fetchAllSignInfo(uniqueSigns: ZodiacSignType[]): Promise<Map<string, Sign>> {
    const signInfoMap = new Map<string, Sign>();
    
    const signInfoPromises = uniqueSigns.map(async (sign) => {
      const signInfo = await this.signsService.findByName(sign);
      if (signInfo) signInfoMap.set(sign, signInfo);
      return signInfo;
    });
    
    await Promise.all(signInfoPromises);
    return signInfoMap;
  }

  private async buildPlanetaryData(
    signs: Record<PlanetType, ZodiacSignType>,
    signInfoMap: Map<string, Sign>
  ): Promise<UserAstrologyData['planetaryData']> {
    const planetaryData = {} as UserAstrologyData['planetaryData'];
    
    const planetaryPromises = (Object.entries(signs) as [PlanetType, ZodiacSignType][]).map(
      async ([planet, sign]) => {
        const [position, signInfo] = await Promise.all([
          this.planetaryPositionsService.findByPosition(planet, sign),
          Promise.resolve(signInfoMap.get(sign))
        ]);
        
        if (position && signInfo) {
          planetaryData[planet] = { sign, position, signInfo };
        }
      }
    );

    await Promise.all(planetaryPromises);
    return planetaryData;
  }

  private async fetchAllInteractions(signInfoMap: Map<string, Sign>) {
    // Get all unique elements and modalities from the signs
    const elements = [...new Set([...signInfoMap.values()].map(s => s.element))];
    const modalities = [...new Set([...signInfoMap.values()].map(s => s.modality))];

    // Batch fetch all required interactions
    const [planetInteractions, elementInteractions, modalityInteractions] = await Promise.all([
      this.fetchPlanetInteractions(),
      this.fetchElementInteractions(elements),  
      this.fetchModalityInteractions(modalities)
    ]);

    return {
      planets: planetInteractions,
      elements: elementInteractions,
      modalities: modalityInteractions
    };
  }

  private async fetchPlanetInteractions(): Promise<Record<string, PlanetInteraction>> {
    const interactions: Record<string, PlanetInteraction> = {};
    
    const interactionPromises = REQUIRED_PLANET_INTERACTIONS.map(async (key) => {
      const [planet1, planet2] = key.split('-') as [PlanetType, PlanetType];
      const interaction = await this.planetInteractionsService.findByPlanets(planet1, planet2);
      if (interaction) {
        interactions[key] = interaction;
      }
    });

    await Promise.all(interactionPromises);
    return interactions;
  }

  private async fetchElementInteractions(elements: string[]): Promise<Record<string, ElementInteraction>> {
    const interactions: Record<string, ElementInteraction> = {};
    
    // Get all unique element pairs
    const elementPairs = this.getUniquePairs(elements);
    
    const interactionPromises = elementPairs.map(async ([element1, element2]) => {
      const key = createInteractionKey(element1, element2);
      const interaction = await this.elementInteractionsService.findByElements(element1, element2);
      if (interaction) {
        interactions[key] = interaction;
      }
    });

    await Promise.all(interactionPromises);
    return interactions;
  }

  private async fetchModalityInteractions(modalities: string[]): Promise<Record<string, ModalityInteraction>> {
    const interactions: Record<string, ModalityInteraction> = {};
    
    // Get all unique modality pairs  
    const modalityPairs = this.getUniquePairs(modalities);
    
    const interactionPromises = modalityPairs.map(async ([modality1, modality2]) => {
      const key = createInteractionKey(modality1, modality2);
      const interaction = await this.modalityInteractionsService.findByModalities(modality1, modality2);
      if (interaction) {
        interactions[key] = interaction;
      }
    });

    await Promise.all(interactionPromises);
    return interactions;
  }

  private getUniquePairs<T>(items: T[]): [T, T][] {
    const pairs: [T, T][] = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        pairs.push([items[i], items[j]]);
      }
    }
    return pairs;
  }
}