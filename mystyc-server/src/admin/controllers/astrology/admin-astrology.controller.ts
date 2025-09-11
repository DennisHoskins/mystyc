import { Controller, Get, UseGuards, Param } from '@nestjs/common';

import { UserRole } from 'mystyc-common/constants';
import { AstrologySummary } from 'mystyc-common/admin/interfaces/summary';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

import { SignsService } from '@/astrology/services/signs.service';
import { PlanetsService } from '@/astrology/services/planets.service';
import { HousesService } from '@/astrology/services/houses.service';
import { ElementsService } from '@/astrology/services/elements.service';
import { ModalitiesService } from '@/astrology/services/modalities.service';
import { PolaritiesService } from '@/astrology/services/polarities.service';
import { DynamicsService } from '@/astrology/services/dynamics.service';
import { EnergyTypesService } from '@/astrology/services/energy-types.service';
import { SignInteractionsService } from '@/astrology/services/sign-interactions.service';
import { ElementInteractionsService } from '@/astrology/services/element-interactions.service';
import { ModalityInteractionsService } from '@/astrology/services/modality-interactions.service';
import { PlanetInteractionsService } from '@/astrology/services/planet-interactions.service';
import { PlanetaryPositionsService } from '@/astrology/services/planetary-positions.service';
import { PolarityInteractionsService } from '@/astrology/services/polarity-interactions.service';

@Controller('admin/astrology')
export class AdminAstrologyController {
  protected serviceName = 'Astrology';

  constructor(
    private readonly signsService: SignsService,
    private readonly planetsService: PlanetsService,
    private readonly housesService: HousesService,
    private readonly elementsService: ElementsService,
    private readonly modalitiesService: ModalitiesService,
    private readonly polaritiesService: PolaritiesService,
    private readonly dynamicsService: DynamicsService,
    private readonly energyTypesService: EnergyTypesService,    
    private readonly signInteractionsService: SignInteractionsService,
    private readonly elementInteractionsService: ElementInteractionsService,
    private readonly modalityInteractionsService: ModalityInteractionsService,
    private readonly planetInteractionsService: PlanetInteractionsService,
    private readonly planetaryPositionsService: PlanetaryPositionsService,
    private readonly polarityInteractionsService: PolarityInteractionsService,
  ) {}

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
      houses,
      elements,
      modalities, 
      polarities,
      dynamics,
      energyTypes,
      signInteractions,
      planetaryPositions,
      elementInteractions,
      modalityInteractions,
      planetInteractions,
      polarityInteractions,
    ] = await Promise.all([
      this.signsService.getTotal(),
      this.planetsService.getTotal(),
      this.housesService.getTotal(),
      this.elementsService.getTotal(),
      this.modalitiesService.getTotal(),
      this.polaritiesService.getTotal(),
      this.dynamicsService.getTotal(),
      this.energyTypesService.getTotal(),
      this.signInteractionsService.getTotal(),
      this.planetaryPositionsService.getTotal(),
      this.elementInteractionsService.getTotal(),
      this.modalityInteractionsService.getTotal(),
      this.planetInteractionsService.getTotal(),
      this.polarityInteractionsService.getTotal()
    ]);

    return {
      signs,
      planets,
      houses,
      elements,
      modalities,
      polarities,
      dynamics,
      energyTypes,
      signInteractions,
      planetaryPositions,
      elementInteractions,
      modalityInteractions,
      planetInteractions,
      polarityInteractions,
    };
  }
}