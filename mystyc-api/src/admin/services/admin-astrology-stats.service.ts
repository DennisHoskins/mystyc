import { Injectable } from '@nestjs/common';

import { AdminStatsQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { SignsService } from '@/astrology/signs.service';
import { PlanetsService } from '@/astrology/planets.service';
import { ElementsService } from '@/astrology/elements.service';
import { ModalitiesService } from '@/astrology/modalities.service';
import { DynamicsService } from '@/astrology/dynamics.service';
import { EnergyTypesService } from '@/astrology/energy-types.service';
import { PlanetaryPositionsService } from '@/astrology/planetary-positions.service';
import { ElementInteractionsService } from '@/astrology/element-interactions.service';
import { ModalityInteractionsService } from '@/astrology/modality-interactions.service';
import { PlanetInteractionsService } from '@/astrology/planet-interactions.service';
import { RegisterStatsModule } from '@/admin/stats/stats-registry';

export interface AstrologySummaryStats {
  totalSigns: number;
  totalPlanets: number;
  totalElements: number;
  totalModalities: number;
  totalDynamics: number;
  totalEnergyTypes: number;
  totalPlanetaryPositions: number;
  totalElementInteractions: number;
  totalModalityInteractions: number;
  totalPlanetInteractions: number;
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
    private readonly elementsService: ElementsService,
    private readonly modalitiesService: ModalitiesService,
    private readonly dynamicsService: DynamicsService,
    private readonly energyTypesService: EnergyTypesService,
    private readonly planetaryPositionsService: PlanetaryPositionsService,
    private readonly elementInteractionsService: ElementInteractionsService,
    private readonly modalityInteractionsService: ModalityInteractionsService,
    private readonly planetInteractionsService: PlanetInteractionsService,
  ) {}

  async getSummaryStats(query?: AdminStatsQuery): Promise<AstrologySummaryStats> {
    logger.info('Generating astrology summary stats', { query }, 'AdminAstrologyStatsService');
    
    try {
      const [
        totalSigns,
        totalPlanets, 
        totalElements,
        totalModalities,
        totalDynamics,
        totalEnergyTypes,
        totalPlanetaryPositions,
        totalElementInteractions,
        totalModalityInteractions,
        totalPlanetInteractions
      ] = await Promise.all([
        this.signsService.getTotal(),
        this.planetsService.getTotal(),
        this.elementsService.getTotal(),
        this.modalitiesService.getTotal(),
        this.dynamicsService.getTotal(),
        this.energyTypesService.getTotal(),
        this.planetaryPositionsService.getTotal(),
        this.elementInteractionsService.getTotal(),
        this.modalityInteractionsService.getTotal(),
        this.planetInteractionsService.getTotal()
      ]);

      logger.info('Astrology summary stats generated', {
        totalSigns,
        totalPlanets,
        totalElements,
        totalModalities,
        totalDynamics,
        totalEnergyTypes,
        totalPlanetaryPositions,
        totalElementInteractions,
        totalModalityInteractions,
        totalPlanetInteractions
      }, 'AdminAstrologyStatsService');

      return {
        totalSigns,
        totalPlanets,
        totalElements,
        totalModalities,
        totalDynamics,
        totalEnergyTypes,
        totalPlanetaryPositions,
        totalElementInteractions,
        totalModalityInteractions,
        totalPlanetInteractions
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