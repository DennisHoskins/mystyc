import { Controller, UseGuards, Get, Query } from '@nestjs/common';

import { UserRole } from 'mystyc-common/constants';
import { BaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { Roles } from '@/common/decorators/roles.decorator';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { createServiceLogger } from '@/common/util/logger';

import { SignsService } from './signs.service';
import { PlanetsService } from './planets.service';
import { ElementsService } from './elements.service';
import { ModalitiesService } from './modalities.service';
import { DynamicsService } from './dynamics.service';
import { EnergyTypesService } from './energy-types.service';
import { PlanetaryPositionsService } from './planetary-positions.service';
import { ElementInteractionsService } from './element-interactions.service';
import { ModalityInteractionsService } from './modality-interactions.service';
import { PlanetInteractionsService } from './planet-interactions.service';

@Controller('astrology')
export class AstrologyKnowledgeController {
  private logger = createServiceLogger('AstrologyKnowledgeController');

  constructor(
    private readonly signsService: SignsService,
    private readonly planetsService: PlanetsService,
    private readonly elementsService: ElementsService,
    private readonly modalitiesService: ModalitiesService,
    private readonly dynamicsService: DynamicsService,
    private readonly energyTypesService: EnergyTypesService,
    private readonly planetaryPositionService: PlanetaryPositionsService,
    private readonly elementInteractionService: ElementInteractionsService,
    private readonly modalityInteractionService: ModalityInteractionsService,
    private readonly planetInteractionService: PlanetInteractionsService
  ) {}
  
  @Get('signs')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSigns(@Query() query: BaseAdminQuery) {
    this.logger.debug('Getting signs', { query });

    const [data, total] = await Promise.all([
      this.signsService.findAll(query),
      this.signsService.getTotal()
    ]);

    this.logger.debug('Signs retrieved', { count: data.length, total });

    return { data, total };
  }

  @Get('planets')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPlanets(@Query() query: BaseAdminQuery) {
    this.logger.debug('Getting planets', { query });

    const [data, total] = await Promise.all([
      this.planetsService.findAll(query),
      this.planetsService.getTotal()
    ]);

    this.logger.debug('Planets retrieved', { count: data.length, total });

    return { data, total };
  }

  @Get('elements')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getElements(@Query() query: BaseAdminQuery) {
    this.logger.debug('Getting elements', { query });

    const [data, total] = await Promise.all([
      this.elementsService.findAll(query),
      this.elementsService.getTotal()
    ]);

    this.logger.debug('Elements retrieved', { count: data.length, total });

    return { data, total };
  }

  @Get('modalities')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getModalities(@Query() query: BaseAdminQuery) {
    this.logger.debug('Getting modalities', { query });

    const [data, total] = await Promise.all([
      this.modalitiesService.findAll(query),
      this.modalitiesService.getTotal()
    ]);

    this.logger.debug('Modalities retrieved', { count: data.length, total });

    return { data, total };
  }

  @Get('dynamics')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDynamics(@Query() query: BaseAdminQuery) {
    this.logger.debug('Getting dynamics', { query });

    const [data, total] = await Promise.all([
      this.dynamicsService.findAll(query),
      this.dynamicsService.getTotal()
    ]);

    this.logger.debug('Dynamics retrieved', { count: data.length, total });

    return { data, total };
  }

  @Get('energy-types')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getEnergyTypes(@Query() query: BaseAdminQuery) {
    this.logger.debug('Getting energy types', { query });

    const [data, total] = await Promise.all([
      this.energyTypesService.findAll(query),
      this.energyTypesService.getTotal()
    ]);

    this.logger.debug('Energy types retrieved', { count: data.length, total });

    return { data, total };
  }

  @Get('planetary-positions')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPlanetaryPositions(@Query() query: BaseAdminQuery) {
    this.logger.debug('Getting planetary positions', { query });

    const [data, total] = await Promise.all([
      this.planetaryPositionService.findAll(query),
      this.planetaryPositionService.getTotal()
    ]);

    this.logger.debug('Planetary positions retrieved', { count: data.length, total });

    return { data, total };
  }

  @Get('element-interactions')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getElementInteractions(@Query() query: BaseAdminQuery) {
    this.logger.debug('Getting element interactions', { query });

    const [data, total] = await Promise.all([
      this.elementInteractionService.findAll(query),
      this.elementInteractionService.getTotal()
    ]);

    this.logger.debug('Element interactions retrieved', { count: data.length, total });

    return { data, total };
  }

  @Get('modality-interactions')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getModalityInteractions(@Query() query: BaseAdminQuery) {
    this.logger.debug('Getting modality interactions', { query });

    const [data, total] = await Promise.all([
      this.modalityInteractionService.findAll(query),
      this.modalityInteractionService.getTotal()
    ]);

    this.logger.debug('Modality interactions retrieved', { count: data.length, total });

    return { data, total };
  }

  @Get('planet-interactions')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPlanetInteractions(@Query() query: BaseAdminQuery) {
    this.logger.debug('Getting planet interactions', { query });

    const [data, total] = await Promise.all([
      this.planetInteractionService.findAll(query),
      this.planetInteractionService.getTotal()
    ]);

    this.logger.debug('Planet interactions retrieved', { count: data.length, total });

    return { data, total };
  }
}