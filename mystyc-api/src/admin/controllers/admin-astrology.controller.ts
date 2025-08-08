import { Controller, Get, UseGuards, Param } from '@nestjs/common';

import { UserRole } from 'mystyc-common/constants';
import { AstrologySummary } from 'mystyc-common/admin/interfaces/summary';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

import { SignsService } from '@/astrology/signs.service';
import { PlanetsService } from '@/astrology/planets.service';
import { ElementsService } from '@/astrology/elements.service';
import { ModalitiesService } from '@/astrology/modalities.service';
import { DynamicsService } from '@/astrology/dynamics.service';
import { EnergyTypesService } from '@/astrology/energy-types.service';
import { ElementInteractionsService } from '@/astrology/element-interactions.service';
import { ModalityInteractionsService } from '@/astrology/modality-interactions.service';
import { PlanetInteractionsService } from '@/astrology/planet-interactions.service';
import { PlanetaryPositionsService } from '@/astrology/planetary-positions.service';

@Controller('admin/astrology')
export class AdminAstrologyController {
  protected serviceName = 'Astrology';

  constructor(
    private readonly signsService: SignsService,
    private readonly planetsService: PlanetsService,
    private readonly elementsService: ElementsService,
    private readonly modalitiesService: ModalitiesService,
    private readonly dynamicsService: DynamicsService,
    private readonly energyTypesService: EnergyTypesService,    
    private readonly elementInteractionsService: ElementInteractionsService,
    private readonly modalityInteractionsService: ModalityInteractionsService,
    private readonly planetInteractionsService: PlanetInteractionsService,
    private readonly planetaryPositionsService: PlanetaryPositionsService,
  ) {
  }

  // GET Methods (Read Operations)

  /**
   * Gets summary statistics for users
   * @returns Promise<{}> - Users stats
   */
  @Get('/summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAstrologySummary(@Param('firebaseUid') firebaseUid: string): Promise<AstrologySummary> {

    const [
      signs,
      planets,
      elements,
      modalities, 
      dynamics,
      energyTypes,
      planetaryPositions,
      elementInteractions,
      modalityInteractions,
      planetInteractions
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

    return {
      signs,
      planets,
      elements,
      modalities,
      dynamics,
      energyTypes,
      planetaryPositions,
      elementInteractions,
      modalityInteractions,
      planetInteractions
    };
  }
}