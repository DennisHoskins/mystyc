import { Controller, UseGuards, Get, Query } from '@nestjs/common';

import { UserRole } from 'mystyc-common/constants';
import { BaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { Roles } from '@/common/decorators/roles.decorator';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { createServiceLogger } from '@/common/util/logger';

import { PlanetaryPositionsService } from './planetary-positions.service';
import { ElementInteractionsService } from './element-interactions.service';
import { ModalityInteractionsService } from './modality-interactions.service';
import { PlanetInteractionsService } from './planet-interactions.service';

@Controller('astrology')
export class AstrologyKnowledgeController {
  private logger = createServiceLogger('AstrologyKnowledgeController');

  constructor(
    private readonly planetaryPositionService: PlanetaryPositionsService,
    private readonly elementInteractionService: ElementInteractionsService,
    private readonly modalityInteractionService: ModalityInteractionsService,
    private readonly planetInteractionService: PlanetInteractionsService
  ) {}

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