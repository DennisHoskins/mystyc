import { Injectable } from '@nestjs/common';

import { AdminStatsQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { SignsService } from '@/astrology/services/signs.service';
import { PlanetsService } from '@/astrology/services/planets.service';
import { HousesService } from '@/astrology/services/houses.service';
import { ElementsService } from '@/astrology/services/elements.service';
import { ModalitiesService } from '@/astrology/services/modalities.service';
import { PolaritiesService } from '@/astrology/services/polarities.service';
import { DynamicsService } from '@/astrology/services/dynamics.service';
import { EnergyTypesService } from '@/astrology/services/energy-types.service';
import { PlanetaryPositionsService } from '@/astrology/services/planetary-positions.service';
import { ElementInteractionsService } from '@/astrology/services/element-interactions.service';
import { ModalityInteractionsService } from '@/astrology/services/modality-interactions.service';
import { PlanetInteractionsService } from '@/astrology/services/planet-interactions.service';
import { PolarityInteractionsService } from '@/astrology/services/polarity-interactions.service';
import { RegisterStatsModule } from '@/admin/stats/stats-registry';

export interface AstrologySummaryStats {
  totalSigns: number;
  totalPlanets: number;
  totalHouses: number;
  totalElements: number;
  totalModalities: number;
  totalPolarities: number;
  totalDynamics: number;
  totalEnergyTypes: number;
  totalPlanetaryPositions: number;
  totalElementInteractions: number;
  totalModalityInteractions: number;
  totalPlanetInteractions: number;
  totalPolarityInteractions: number;
}

@RegisterStatsModule({
  serviceName: 'Astrology',
  service: AdminAstrologyStatsService,
  stats: [
    { key: 'summary', method: 'getSummaryStats' }
  ]
})
@Injectable()
export class AdminAstrologyStatsService {
  constructor(
    private readonly signsService: SignsService,
    private readonly planetsService: PlanetsService,
    private readonly housesService: HousesService,
    private readonly elementsService: ElementsService,
    private readonly modalitiesService: ModalitiesService,
    private readonly polaritiesService: PolaritiesService,
    private readonly dynamicsService: DynamicsService,
    private readonly energyTypesService: EnergyTypesService,
    private readonly planetaryPositionsService: PlanetaryPositionsService,
    private readonly elementInteractionsService: ElementInteractionsService,
    private readonly modalityInteractionsService: ModalityInteractionsService,
    private readonly planetInteractionsService: PlanetInteractionsService,
    private readonly polarityInteractionsService: PolarityInteractionsService,
  ) {}

  async getSummaryStats(query?: AdminStatsQuery): Promise<AstrologySummaryStats> {
    logger.info('Generating astrology summary stats', { query }, 'AdminAstrologyStatsService');
    
    try {
      const [
        totalSigns,
        totalPlanets, 
        totalHouses,
        totalElements,
        totalModalities,
        totalPolarities,
        totalDynamics,
        totalEnergyTypes,
        totalPlanetaryPositions,
        totalElementInteractions,
        totalModalityInteractions,
        totalPlanetInteractions,
        totalPolarityInteractions
      ] = await Promise.all([
        this.signsService.getTotal(),
        this.planetsService.getTotal(),
        this.housesService.getTotal(),
        this.elementsService.getTotal(),
        this.modalitiesService.getTotal(),
        this.polaritiesService.getTotal(),
        this.dynamicsService.getTotal(),
        this.energyTypesService.getTotal(),
        this.planetaryPositionsService.getTotal(),
        this.elementInteractionsService.getTotal(),
        this.modalityInteractionsService.getTotal(),
        this.planetInteractionsService.getTotal(),
        this.polarityInteractionsService.getTotal()
      ]);

      logger.info('Astrology summary stats generated', {
        totalSigns,
        totalPlanets,
        totalHouses,
        totalElements,
        totalModalities,
        totalPolarities,
        totalDynamics,
        totalEnergyTypes,
        totalPlanetaryPositions,
        totalElementInteractions,
        totalModalityInteractions,
        totalPlanetInteractions,
        totalPolarityInteractions
      }, 'AdminAstrologyStatsService');

      return {
        totalSigns,
        totalPlanets,
        totalHouses,
        totalElements,
        totalModalities,
        totalPolarities,
        totalDynamics,
        totalEnergyTypes,
        totalPlanetaryPositions,
        totalElementInteractions,
        totalModalityInteractions,
        totalPlanetInteractions,
        totalPolarityInteractions
      };

    } catch (error) {
      logger.error('Failed to generate astrology summary stats', {
        error,
        query
      }, 'AdminAstrologyStatsService');
      throw error;
    }
  }
}