import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ModalityInteraction } from 'mystyc-common/schemas';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { ModalityInteractionDocument } from '../schemas/modality-interaction.schema';

@Injectable()
export class ModalityInteractionsService {
  constructor(
    @InjectModel('ModalityInteraction') private modalityInteractionModel: Model<ModalityInteractionDocument>
  ) {}

  /**
   * Finds modality interaction by ID, returns null if not found (admin use)
   * @param id - MongoDB ObjectId as string
   * @returns Promise<ModalityInteraction | null> - ModalityInteraction if found, null if not found
   */
  async findById(id: string): Promise<ModalityInteraction | null> {
    logger.debug('Finding modality interaction by ID', { id }, 'ModalityInteractionsService');

    try {
      const interaction = await this.modalityInteractionModel.findById(id);

      if (!interaction) {
        logger.debug('Modality Interaction not found', { id }, 'ModalityInteractionsService');
        return null;
      }

      logger.debug('Modality Interaction found', {
        id,
        modality1: interaction.modality1,
        modality2: interaction.modality2,
      }, 'ModalityInteractionsService');

      return this.transformToInterface(interaction);
    } catch (error) {
      logger.error('Failed to find modality interaction by ID', {
        id,
        error
      }, 'ModalityInteractionsService');

      return null;
    }
  }

  /**
   * Finds modality interactions by modality (either modality1 or modality2), normalizing results
   * @param modality - modality name as string (e.g., 'Sun', 'Moon', etc.)
   * @returns Promise<ModalityInteraction[]> - Array of modality interactions with queried modality always as modality1
   */
  async findByModality(modality: string): Promise<ModalityInteraction[]> {
    logger.debug('Finding modality interactions by modality', { modality }, 'ModalityInteractionsService');

    try {
      // Find interactions where modality appears in either position
      const sortObj: any = {};
      sortObj['modality2'] = 1; // Sort by the second modality alphabetically
      const interactions = await this.modalityInteractionModel
        .find({
          $or: [
            { modality1: modality },
            { modality2: modality }
          ]
        })
        .sort(sortObj)
        .exec();

      logger.debug('Modality interactions found for modality', {
        modality,
        count: interactions.length
      }, 'ModalityInteractionsService');

      // Transform results to normalize queried modality as modality1
      return interactions.map(interaction => {
        const transformed = this.transformToInterface(interaction);
        
        // If the queried modality is modality2, swap them
        if (transformed.modality2 === modality && transformed.modality1 !== modality) {
          return {
            ...transformed,
            modality1: transformed.modality2,
            modality2: transformed.modality1
          };
        }
        
        return transformed;
      });
    } catch (error) {
      logger.error('Failed to find modality interactions by modality', {
        modality,
        error
      }, 'ModalityInteractionsService');

      return [];
    }
  }

  /**
   * Finds modality interaction by two specific modalitys
   * @param modality1 - First modality name
   * @param modality2 - Second modality name
   * @returns Promise<ModalityInteraction | null> - Interaction if found, null if not found
   */
  async findByModalities(modality1: string, modality2: string): Promise<ModalityInteraction | null> {
    logger.debug('Finding modality interaction by modalitys', { modality1, modality2 }, 'ModalityInteractionsService');

    try {
      // Find interaction where both modalitys match (in either order)
      const interaction = await this.modalityInteractionModel
        .findOne({
          $or: [
            { modality1: modality1, modality2: modality2 },
            { modality1: modality2, modality2: modality1 }
          ]
        })
        .exec();

      if (!interaction) {
        logger.debug('Modality interaction not found', { modality1, modality2 }, 'ModalityInteractionsService');
        return null;
      }

      logger.debug('Modality interaction found', {
        modality1,
        modality2,
        foundModality1: interaction.modality1,
        foundModality2: interaction.modality2
      }, 'ModalityInteractionsService');

      return this.transformToInterface(interaction);
    } catch (error) {
      logger.error('Failed to find modality interaction by modalitys', {
        modality1,
        modality2,
        error
      }, 'ModalityInteractionsService');

      return null;
    }
  }

  /**
   * Finds modality interactions by dynamic
   * @param dynamic - dynamic name as string
   * @returns Promise<ModalityInteraction[]> - Array of modality interactions
   */
  async findByDynamic(dynamic: string): Promise<ModalityInteraction[]> {
    logger.debug('Finding modality interactions by dynamic', { dynamic }, 'ModalityInteractionsService');

    try {
      const sortObj: any = {};
      sortObj['modality1'] = 1;
      const interactions = await this.modalityInteractionModel
        .find({ dynamic: dynamic })
        .sort(sortObj)
        .exec();

      logger.debug('Modality interactions found for dynamic', {
        dynamic,
        count: interactions.length
      }, 'ModalityInteractionsService');

      return interactions.map(interaction => {
        const transformed = this.transformToInterface(interaction);
        return transformed;
      });
    } catch (error) {
      logger.error('Failed to find modality interactions by dynamic', {
        dynamic,
        error
      }, 'ModalityInteractionsService');

      return [];
    }
  }

  /**
   * @returns number - Retrieves modality interaction records total
   */
  async getTotal(): Promise<number> {
    return await this.modalityInteractionModel.countDocuments();
  }

  /**
   * Retrieves modality interactions with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<ModalityInteraction[]> - Array of modality interactions with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<ModalityInteraction[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding modality interactions with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'ModalityInteractionsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const interactions = await this.modalityInteractionModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Modality interactions found', { 
      count: interactions.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'ModalityInteractionsService');
    
    return interactions.map(interaction => this.transformToInterface(interaction));
  }

  /**
   * Transforms MongoDB document to clean ModalityInteraction interface
   * @param doc - MongoDB modality interaction document
   * @returns ModalityInteraction - Clean modality interaction object
   */
  private transformToInterface(doc: ModalityInteractionDocument): ModalityInteraction {
    return {
      _id: doc._id?.toString(),
      modality1: doc.modality1 as any,
      modality2: doc.modality2 as any,
      dynamic: doc.dynamic as any,
      description: doc.description,
      action: doc.action,
      keywords: doc.keywords,
      energyType: doc.energyType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}