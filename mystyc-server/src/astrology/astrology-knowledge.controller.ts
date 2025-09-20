import { Controller, UseGuards, Get, Query, Param, NotFoundException } from '@nestjs/common';

import { UserRole } from 'mystyc-common/constants';
import { BaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { SignComplete, SignInteraction, SignInteractionComplete } from 'mystyc-common/index';

import { Roles } from '@/common/decorators/roles.decorator';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { isErrorWithStatus } from '@/common/util/error';
import { createServiceLogger, logger } from '@/common/util/logger';

import { SignsService } from './services/signs.service';
import { PlanetsService } from './services/planets.service';
import { ElementsService } from './services/elements.service';
import { ModalitiesService } from './services/modalities.service';
import { DynamicsService } from './services/dynamics.service';
import { PolaritiesService } from './services/polarities.service';
import { HousesService } from './services/houses.service';
import { EnergyTypesService } from './services/energy-types.service';
import { SignInteractionsService } from './services/sign-interactions.service';
import { PlanetaryPositionsService } from './services/planetary-positions.service';
import { ElementInteractionsService } from './services/element-interactions.service';
import { ModalityInteractionsService } from './services/modality-interactions.service';
import { PlanetInteractionsService } from './services/planet-interactions.service';

@Controller('astrology')
export class AstrologyKnowledgeController {
  private logger = createServiceLogger('AstrologyKnowledgeController');

  constructor(
    private readonly signsService: SignsService,
    private readonly planetsService: PlanetsService,
    private readonly elementsService: ElementsService,
    private readonly modalitiesService: ModalitiesService,
    private readonly dynamicsService: DynamicsService,
    private readonly polaritiesService: PolaritiesService,
    private readonly housesService: HousesService,
    private readonly energyTypesService: EnergyTypesService,
    private readonly signInteractionsService: SignInteractionsService,
    private readonly planetaryPositionService: PlanetaryPositionsService,
    private readonly elementInteractionService: ElementInteractionsService,
    private readonly modalityInteractionService: ModalityInteractionsService,
    private readonly planetInteractionService: PlanetInteractionsService,
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

  @Get('sign/:sign')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  async getSign(@Param('sign') sign: string): Promise<SignComplete> {
    logger.info('User fetching sign by name', { sign }, 'AstrologyKnowledgeController');
    
    try {
      const signResult = await this.signsService.findByName(sign);
      
      if (!signResult) {
        logger.warn('Sign not found', { sign }, 'AstrologyKnowledgeController');
        throw new NotFoundException('Sign not found');
      }

      // Fetch related data in parallel (existing logic)
      const [houseData, elementData, modalityData, polarityData, energyTypeData] = await Promise.all([
        this.housesService.findByNumber(signResult.basics.naturalHouse),
        this.elementsService.findByName(signResult.element),
        this.modalitiesService.findByName(signResult.modality),
        this.polaritiesService.findByName(signResult.basics.polarity),
        this.energyTypesService.findByName(signResult.energyType)
      ]);

      // Fetch house sign data
      const houseSignData = await this.signsService.findByName(signResult.basics.rulingPlanet);

      // Fetch energy types for element and modality (existing logic)
      const [houseEnergyTypeData, elementEnergyTypeData, modalityEnergyTypeData, polarityEnergyTypeData] = await Promise.all([
        houseData ? this.energyTypesService.findByName(houseData.energyType) : null,
        elementData ? this.energyTypesService.findByName(elementData.energyType) : null,
        modalityData ? this.energyTypesService.findByName(modalityData.energyType) : null,
        polarityData ? this.energyTypesService.findByName(polarityData.energyType) : null
      ]);

      // NEW: Fetch best and worst interactions
      const [bestInteraction, worstInteraction] = await Promise.all([
        this.signInteractionsService.findBestInteraction(sign),
        this.signInteractionsService.findWorstInteraction(sign)
      ]);

      logger.info('Sign with complete related data retrieved successfully', { 
        sign, 
        hasHouse: !!houseData,
        hasElement: !!elementData,
        hasModality: !!modalityData,
        hasPolarity: !!polarityData,
        hasEnergyType: !!energyTypeData,
        hasHouseEnergyType: !!houseEnergyTypeData,
        hasElementEnergyType: !!elementEnergyTypeData,
        hasModalityEnergyType: !!modalityEnergyTypeData,
        hasPolarityEnergyType: !!polarityEnergyTypeData,
        hasBestInteraction: !!bestInteraction,
        hasWorstInteraction: !!worstInteraction
      }, 'AstrologyKnowledgeController');
      
      // Return SignComplete with all nested data + best/worst interactions
      const signComplete: SignComplete = {
        ...signResult,
        houseData: houseData ? {
          ...houseData,
          naturalRulerSignData: houseSignData,
          energyTypeData: houseEnergyTypeData
        } : null,
        elementData: elementData ? {
          ...elementData,
          energyTypeData: elementEnergyTypeData
        } : null,
        modalityData: modalityData ? {
          ...modalityData,
          energyTypeData: modalityEnergyTypeData
        } : null,
        polarityData: polarityData ? {
          ...polarityData,
          energyTypeData: polarityEnergyTypeData
        } : null,
        energyTypeData,
        bestInteraction,
        worstInteraction
      };

      return signComplete;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get sign with complete related data', {
        sign,
        error
      }, 'AstrologyKnowledgeController');
      
      throw error;
    }
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

  @Get('sign-interactions')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSignInteractions(@Query() query: BaseAdminQuery) {
    this.logger.debug('Getting sign interactions', { query });

    const [data, total] = await Promise.all([
      this.signInteractionsService.findAll(query),
      this.signInteractionsService.getTotal()
    ]);

    this.logger.debug('Sign interactions retrieved', { count: data.length, total });

    return { data, total };
  }

  @Get('sign-interactions/:sign')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  async getSignSignInteractions(@Param('sign') sign: string): Promise<SignInteraction[]> {
    this.logger.debug('Getting sign interactions for sign', { sign });
    try {
      const data = await this.signInteractionsService.findBySign(sign);

      this.logger.debug('Sign interactions retrieved', { count: data.length });

      return data;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get sign interactions', {
        sign,
        error
      }, 'AstrologyKnowledgeController');
      
      throw error;
    }
  }

  @Get('sign-interaction/:sign1/:sign2')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  async getSignInteractionComplete(
    @Param('sign1') sign1: string, 
    @Param('sign2') sign2: string
  ): Promise<SignInteractionComplete | null> {
    logger.info('User fetching complete sign interaction', { sign1, sign2 }, 'AstrologyKnowledgeController');
    
    try {
      const signInteractionComplete = await this.signInteractionsService.findSignInteractionComplete(sign1, sign2);
      
      if (!signInteractionComplete) {
        logger.warn('Sign interaction not found', { sign1, sign2 }, 'AstrologyKnowledgeController');
        return null;
      }

      logger.info('Complete sign interaction retrieved successfully', { 
        sign1, 
        sign2
      }, 'AstrologyKnowledgeController');
      
      return signInteractionComplete;
    } catch (error) {
      if (isErrorWithStatus(error) && error.status === 404) {
        throw error;
      }
      
      logger.error('Failed to get complete sign interaction', {
        sign1,
        sign2,
        error
      }, 'AstrologyKnowledgeController');
      
      throw error;
    }
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

  @Get('polarities')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPolarities(@Query() query: BaseAdminQuery) {
    this.logger.debug('Getting polarities', { query });

    const [data, total] = await Promise.all([
      this.polaritiesService.findAll(query),
      this.polaritiesService.getTotal()
    ]);

    this.logger.debug('Polarities retrieved', { count: data.length, total });

    return { data, total };
  }

  @Get('houses')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getHouses(@Query() query: BaseAdminQuery) {
    this.logger.debug('Getting houses', { query });

    const [data, total] = await Promise.all([
      this.housesService.findAll(query),
      this.housesService.getTotal()
    ]);

    this.logger.debug('Houses retrieved', { count: data.length, total });

    return { data, total };
  }
}