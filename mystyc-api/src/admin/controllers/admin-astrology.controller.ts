import { Controller, Query, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';

import { AuthEvent, Content, Device, Notification, PaymentHistory, UserProfile } from 'mystyc-common/schemas/';
import { UserRole, SubscriptionLevel } from 'mystyc-common/constants';
import { AstrologySummary } from 'mystyc-common/admin/interfaces/summary';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { ElementInteractionsService } from '@/astrology/element-interactions.service';
import { ModalityInteractionsService } from '@/astrology/modality-interactions.service';
import { PlanetInteractionsService } from '@/astrology/planet-interactions.service';
import { PlanetaryPositionsService } from '@/astrology/planetary-positions.service';
import { logger } from '@/common/util/logger';
import { AdminController } from './admin.controller';

@Controller('admin/astrology')
export class AdminAstrologyController {
  protected serviceName = 'Astrology';

  constructor(
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

    const [planetaryPositions, elementInteractions, modalityInteractions, planetInteractions] = await Promise.all([
      this.planetaryPositionsService.getTotal(),
      this.elementInteractionsService.getTotal(),
      this.modalityInteractionsService.getTotal(),
      this.planetInteractionsService.getTotal()
    ]);

    return {
      planetaryPositions,
      elementInteractions,
      modalityInteractions,
      planetInteractions
    };
  }
}