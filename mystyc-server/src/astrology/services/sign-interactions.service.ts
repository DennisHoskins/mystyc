import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SignInteractionComplete, SignComplete, PolarityInteractionComplete, ElementInteractionComplete, ModalityInteractionComplete } from 'mystyc-common/interfaces';
import { SignInteraction, Dynamic } from 'mystyc-common/schemas';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { SignsService } from './signs.service';
import { HousesService } from './houses.service';
import { ElementsService } from './elements.service';
import { ModalitiesService } from './modalities.service';
import { PolaritiesService } from './polarities.service';
import { EnergyTypesService } from './energy-types.service';
import { DynamicsService } from './dynamics.service';
import { ElementInteractionsService } from './element-interactions.service';
import { ModalityInteractionsService } from './modality-interactions.service';
import { PolarityInteractionsService } from './polarity-interactions.service';

import { logger } from '@/common/util/logger';
import { SignInteractionDocument } from '../schemas/sign-interaction.schema';

@Injectable()
export class SignInteractionsService {
  constructor(
    @InjectModel('SignInteraction') private signInteractionModel: Model<SignInteractionDocument>,
    
    private readonly signsService: SignsService,
    private readonly housesService: HousesService,
    private readonly elementsService: ElementsService,
    private readonly modalitiesService: ModalitiesService,
    private readonly polaritiesService: PolaritiesService,
    private readonly energyTypesService: EnergyTypesService,
    private readonly dynamicsService: DynamicsService,
    private readonly elementInteractionsService: ElementInteractionsService,
    private readonly modalityInteractionsService: ModalityInteractionsService,
    private readonly polarityInteractionsService: PolarityInteractionsService,
  ) {}

  /**
   * Finds sign interaction by ID, returns null if not found (admin use)
   * @param id - MongoDB ObjectId as string
   * @returns Promise<SignInteraction | null> - SignInteraction if found, null if not found
   */
  async findById(id: string): Promise<SignInteraction | null> {
    logger.debug('Finding sign interaction by ID', { id }, 'SignInteractionsService');

    try {
      const interaction = await this.signInteractionModel.findById(id).exec();

      if (!interaction) {
        logger.debug('Sign interaction not found', { id }, 'SignInteractionsService');
        return null;
      }

      logger.debug('Sign interaction found', {
        id,
        sign1: interaction.sign1,
        sign2: interaction.sign2
      }, 'SignInteractionsService');

      return this.transformToInterface(interaction);
    } catch (error) {
      logger.error('Failed to find sign interaction by ID', {
        id,
        error
      }, 'SignInteractionsService');

      return null;
    }
  }

  /**
   * Finds a specific sign interaction with complete nested data
   * @param sign1 - First sign name
   * @param sign2 - Second sign name  
   * @returns Promise<SignInteractionComplete | null> - Complete interaction or null if not found
   */
  async findSignInteractionComplete(sign1: string, sign2: string): Promise<SignInteractionComplete | null> {
    logger.debug('Finding complete sign interaction', { sign1, sign2 }, 'SignInteractionsService');

    try {
      // 1. Get base sign interaction
      const baseInteraction = await this.findBySigns(sign1, sign2);
      
      if (!baseInteraction) {
        logger.debug('Sign interaction not found', { sign1, sign2 }, 'SignInteractionsService');
        return null;
      }

      // 2. Build the complete interaction
      const completeInteraction = await this.buildSingleSignInteractionComplete(baseInteraction, sign1, sign2);

      logger.debug('Complete sign interaction assembled', {
        sign1,
        sign2
      }, 'SignInteractionsService');

      return completeInteraction;
    } catch (error) {
      logger.error('Failed to find complete sign interaction', {
        sign1,
        sign2,
        error
      }, 'SignInteractionsService');

      throw error;
    }
  }

  /**
   * Builds a single complete sign interaction with all nested data
   * @param interaction - Base sign interaction
   * @param sign1 - The first sign
   * @param sign2 - The second sign
   * @returns Promise<SignInteractionComplete> - Complete interaction
   */
  private async buildSingleSignInteractionComplete(
    interaction: SignInteraction, 
    sign1: string,
    sign2: string
  ): Promise<SignInteractionComplete> {
    logger.debug('Building complete sign interaction', { 
      sign1, 
      sign2 
    }, 'SignInteractionsService');

    // Build sign1Data and sign2Data using the same pattern as getSign controller
    const [sign1Data, sign2Data] = await Promise.all([
      this.buildCompleteSignData(sign1),
      this.buildCompleteSignData(sign2)
    ]);

    // Build interaction-level data
    const [dynamicData, energyTypeData] = await Promise.all([
      this.buildDynamicComplete(interaction.dynamic),
      this.energyTypesService.findByName(interaction.energyType)
    ]);

    // Build cross-sign interaction data
    const [elementInteractionData, modalityInteractionData, polarityInteractionData] = await Promise.all([
      this.buildElementInteractionComplete(sign1Data.element, sign2Data.element),
      this.buildModalityInteractionComplete(sign1Data.modality, sign2Data.modality),
      this.buildPolarityInteractionComplete(sign1Data.basics.polarity, sign2Data.basics.polarity)
    ]);

    return {
      ...interaction,
      sign1Data,
      sign2Data,
      dynamicData,
      energyTypeData,
      elementInteractionData,
      modalityInteractionData,
      polarityInteractionData
    };
  }  

  /**
   * Builds complete sign data (replicating getSign controller logic)
   * @param signName - Sign name to build complete data for
   * @returns Promise<SignComplete> - Complete sign with all nested data
   */
  async buildCompleteSignData(signName: string): Promise<SignComplete> {
    // Get base sign data
    const signResult = await this.signsService.findByName(signName);
    if (!signResult) {
      throw new Error(`Sign not found: ${signName}`);
    }

    // Fetch related data in parallel (same as getSign controller)
    const [houseData, elementData, modalityData, polarityData, energyTypeData] = await Promise.all([
      this.housesService.findByNumber(signResult.basics.naturalHouse),
      this.elementsService.findByName(signResult.element),
      this.modalitiesService.findByName(signResult.modality),
      this.polaritiesService.findByName(signResult.basics.polarity),
      this.energyTypesService.findByName(signResult.energyType)
    ]);

    // Fetch house sign data
    const houseSignData = await this.signsService.findByName(signResult.basics.rulingPlanet);

    // Fetch energy types for nested objects
    const [houseEnergyTypeData, elementEnergyTypeData, modalityEnergyTypeData, polarityEnergyTypeData] = await Promise.all([
      houseData ? this.energyTypesService.findByName(houseData.energyType) : null,
      elementData ? this.energyTypesService.findByName(elementData.energyType) : null,
      modalityData ? this.energyTypesService.findByName(modalityData.energyType) : null,
      polarityData ? this.energyTypesService.findByName(polarityData.energyType) : null
    ]);

    // Assemble SignComplete (same structure as getSign controller)
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
      energyTypeData
    };

    return signComplete;
  }

  /**
   * Builds complete dynamic data with its energy type
   * @param dynamicName - Dynamic name
   * @returns Promise<Dynamic | null> - Complete dynamic or null if not found
   */
  private async buildDynamicComplete(dynamicName: string): Promise<Dynamic | null> {
    const dynamicData = await this.dynamicsService.findByName(dynamicName);
    if (!dynamicData) {
      return null;
    }
    return {
      ...dynamicData
    };
  }

  /**
   * Builds complete element interaction data
   * @param element1 - First element name
   * @param element2 - Second element name
   * @returns Promise<ElementInteractionComplete | null> - Complete element interaction or null if not found
   */
  private async buildElementInteractionComplete(
    element1: string, 
    element2: string
  ): Promise<ElementInteractionComplete | null> {
    const elementInteraction = await this.elementInteractionsService.findByElements(element1, element2);
    if (!elementInteraction) {
      return null;
    }

    const [dynamicData, energyTypeData] = await Promise.all([
      this.buildDynamicComplete(elementInteraction.dynamic),
      this.energyTypesService.findByName(elementInteraction.energyType)
    ]);

    return {
      ...elementInteraction,
      dynamicData,
      energyTypeData
    };
  }

  /**
   * Builds complete modality interaction data
   * @param modality1 - First modality name
   * @param modality2 - Second modality name
   * @returns Promise<ModalityInteractionComplete | null> - Complete modality interaction or null if not found
   */
  private async buildModalityInteractionComplete(
    modality1: string, 
    modality2: string
  ): Promise<ModalityInteractionComplete | null> {
    const modalityInteraction = await this.modalityInteractionsService.findByModalities(modality1, modality2);
    if (!modalityInteraction) {
      return null;
    }

    const [dynamicData, energyTypeData] = await Promise.all([
      this.buildDynamicComplete(modalityInteraction.dynamic),
      this.energyTypesService.findByName(modalityInteraction.energyType)
    ]);

    return {
      ...modalityInteraction,
      dynamicData,
      energyTypeData
    };
  }
  
  /**
   * Builds complete polarity interaction data
   * @param polarity1 - First polarity name
   * @param polarity2 - Second polarity name
   * @returns Promise<PolarityInteractionComplete | null> - Complete polarity interaction or null if not found
   */
  private async buildPolarityInteractionComplete(
    polarity1: string, 
    polarity2: string
  ): Promise<PolarityInteractionComplete | null> {
    const polarityInteraction = await this.polarityInteractionsService.findByPolarities(polarity1, polarity2);
    if (!polarityInteraction) {
      return null;
    }

    const [dynamicData, energyTypeData] = await Promise.all([
      this.buildDynamicComplete(polarityInteraction.dynamic),
      this.energyTypesService.findByName(polarityInteraction.energyType)
    ]);

    return {
      ...polarityInteraction,
      dynamicData,
      energyTypeData
    };
  }  

  /**
   * Finds sign interactions by sign (only when sign is in sign1 position)
   * @param sign - Sign name to search for
   * @returns Promise<SignInteraction[]> - Array of interactions where sign is sign1
   */
  async findBySign(sign: string): Promise<SignInteraction[]> {
    logger.debug('Finding sign interactions by sign', { sign }, 'SignInteractionsService');

    try {
      // Find interactions where sign is in sign1 position only
      const interactions = await this.signInteractionModel
        .find({ sign1: sign })
        .sort({ totalScore: -1 })
        .exec();

      logger.debug('Sign interactions found', {
        sign,
        count: interactions.length
      }, 'SignInteractionsService');

      return interactions.map(interaction => this.transformToInterface(interaction));
    } catch (error) {
      logger.error('Failed to find sign interactions by sign', {
        sign,
        error
      }, 'SignInteractionsService');

      return [];
    }
  }

  /**
   * Finds sign interaction by two specific signs
   * @param sign1 - First sign name
   * @param sign2 - Second sign name
   * @returns Promise<SignInteraction | null> - Interaction if found, null if not found
   */
  async findBySigns(sign1: string, sign2: string): Promise<SignInteraction | null> {
    logger.debug('Finding sign interaction by signs', { sign1, sign2 }, 'SignInteractionsService');

    try {
      // Find interaction with exact sign order (directional)
      const interaction = await this.signInteractionModel
        .findOne({ sign1: sign1, sign2: sign2 })
        .exec();

      if (!interaction) {
        logger.debug('Sign interaction not found', { sign1, sign2 }, 'SignInteractionsService');
        return null;
      }

      logger.debug('Sign interaction found', {
        sign1,
        sign2,
        totalScore: interaction.totalScore
      }, 'SignInteractionsService');

      return this.transformToInterface(interaction);
    } catch (error) {
      logger.error('Failed to find sign interaction by signs', {
        sign1,
        sign2,
        error
      }, 'SignInteractionsService');

      return null;
    }
  }

  /**
   * Finds sign interactions by dynamic
   * @param dynamic - Dynamic name to search for
   * @returns Promise<SignInteraction[]> - Array of interactions
   */
  async findByDynamic(dynamic: string): Promise<SignInteraction[]> {
    logger.debug('Finding sign interactions by dynamic', { dynamic }, 'SignInteractionsService');

    try {
      const sortObj: any = {};
      sortObj['sign1'] = 1;
      const interactions = await this.signInteractionModel
        .find({ dynamic: dynamic })
        .sort(sortObj)
        .exec();

      logger.debug('Sign interactions found', {
        dynamic,
        count: interactions.length
      }, 'SignInteractionsService');

      return interactions.map(interaction => this.transformToInterface(interaction));
    } catch (error) {
      logger.error('Failed to find sign interactions by dynamic', {
        dynamic,
        error
      }, 'SignInteractionsService');

      return [];
    }
  }

  /**
   * Finds top compatible signs for a given sign
   * @param sign - Sign name to find matches for
   * @param limit - Number of top matches to return (default 5)
   * @returns Promise<SignInteraction[]> - Array of top compatible interactions
   */
  async findTopCompatible(sign: string, limit: number = 5): Promise<SignInteraction[]> {
    logger.debug('Finding top compatible signs', { sign, limit }, 'SignInteractionsService');

    try {
      const interactions = await this.signInteractionModel
        .find({
          $or: [
            { sign1: sign },
            { sign2: sign }
          ]
        })
        .sort({ totalScore: -1 })
        .limit(limit)
        .exec();

      logger.debug('Top compatible signs found', {
        sign,
        count: interactions.length
      }, 'SignInteractionsService');

      return interactions.map(interaction => {
        const transformed = this.transformToInterface(interaction);
        
        // Normalize so queried sign is always sign1
        if (transformed.sign2 === sign && transformed.sign1 !== sign) {
          return {
            ...transformed,
            sign1: transformed.sign2,
            sign2: transformed.sign1
          };
        }
        
        return transformed;
      });
    } catch (error) {
      logger.error('Failed to find top compatible signs', {
        sign,
        error
      }, 'SignInteractionsService');

      return [];
    }
  }

  /**
   * Finds the best (highest scoring) interaction for a sign
   * @param sign - Sign name to find best interaction for
   * @returns Promise<SignInteraction | null> - Best interaction or null if none found
   */
  async findBestInteraction(sign: string): Promise<SignInteraction | null> {
    logger.debug('Finding best interaction for sign', { sign }, 'SignInteractionsService');

    try {
      const interaction = await this.signInteractionModel
        .findOne({ sign1: sign })
        .sort({ totalScore: -1, distance: 1 }) // Highest score, shortest distance for ties
        .exec();

      if (!interaction) {
        logger.debug('No best interaction found', { sign }, 'SignInteractionsService');
        return null;
      }

      logger.debug('Best interaction found', {
        sign,
        bestWith: interaction.sign2,
        totalScore: interaction.totalScore,
        distance: interaction.distance
      }, 'SignInteractionsService');

      return this.transformToInterface(interaction);
    } catch (error) {
      logger.error('Failed to find best interaction', {
        sign,
        error
      }, 'SignInteractionsService');

      return null;
    }
  }

  /**
   * Finds the worst (lowest scoring) interaction for a sign
   * @param sign - Sign name to find worst interaction for
   * @returns Promise<SignInteraction | null> - Worst interaction or null if none found
   */
  async findWorstInteraction(sign: string): Promise<SignInteraction | null> {
    logger.debug('Finding worst interaction for sign', { sign }, 'SignInteractionsService');

    try {
      const interaction = await this.signInteractionModel
        .findOne({ sign1: sign })
        .sort({ totalScore: 1, distance: 1 }) // Lowest score, shortest distance for ties
        .exec();

      if (!interaction) {
        logger.debug('No worst interaction found', { sign }, 'SignInteractionsService');
        return null;
      }

      logger.debug('Worst interaction found', {
        sign,
        worstWith: interaction.sign2,
        totalScore: interaction.totalScore,
        distance: interaction.distance
      }, 'SignInteractionsService');

      return this.transformToInterface(interaction);
    } catch (error) {
      logger.error('Failed to find worst interaction', {
        sign,
        error
      }, 'SignInteractionsService');

      return null;
    }
  }  

  /**
   * @returns number - Retrieves sign interaction records total
   */
  async getTotal(): Promise<number> {
    return await this.signInteractionModel.countDocuments();
  }

  /**
   * Retrieves sign interactions with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<SignInteraction[]> - Array of sign interactions with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<SignInteraction[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding sign interactions with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'SignInteractionsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const interactions = await this.signInteractionModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Sign interactions found', { 
      count: interactions.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'SignInteractionsService');
    
    return interactions.map(interaction => this.transformToInterface(interaction));
  }

  /**
   * Transforms MongoDB document to clean SignInteraction interface
   * @param doc - MongoDB sign interaction document
   * @returns SignInteraction - Clean sign interaction object
   */
  private transformToInterface(doc: SignInteractionDocument): SignInteraction {
    return {
      _id: doc._id?.toString(),
      sign1: doc.sign1 as any,
      sign2: doc.sign2 as any,
      dynamic: doc.dynamic as any,
      description: doc.description,
      action: doc.action,
      keywords: doc.keywords,
      energyType: doc.energyType,
      distance: doc.distance,
      totalScore: doc.totalScore,
      elementScore: doc.elementScore,
      modalityScore: doc.modalityScore,
      polarityScore: doc.polarityScore,
      dynamicScore: doc.dynamicScore,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}