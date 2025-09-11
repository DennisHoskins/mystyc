import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PolarityInteraction } from 'mystyc-common/schemas';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { PolarityInteractionDocument } from '../schemas/polarity-interaction.schema';

@Injectable()
export class PolarityInteractionsService {
  constructor(
    @InjectModel('PolarityInteraction') private polarityInteractionModel: Model<PolarityInteractionDocument>
  ) {}

  /**
   * Finds polarity interaction by ID, returns null if not found (admin use)
   * @param id - MongoDB ObjectId as string
   * @returns Promise<PolarityInteraction | null> - PolarityInteraction if found, null if not found
   */
  async findById(id: string): Promise<PolarityInteraction | null> {
    logger.debug('Finding polarity interaction by ID', { id }, 'PolarityInteractionsService');

    try {
      const interaction = await this.polarityInteractionModel.findById(id);

      if (!interaction) {
        logger.debug('Polarity interaction not found', { id }, 'PolarityInteractionsService');
        return null;
      }

      logger.debug('Polarity interaction found', {
        id,
        polarity1: interaction.polarity1,
        polarity2: interaction.polarity2,
      }, 'PolarityInteractionsService');

      return this.transformToInterface(interaction);
    } catch (error) {
      logger.error('Failed to find polarity interaction by ID', {
        id,
        error
      }, 'PolarityInteractionsService');

      return null;
    }
  }

  /**
   * Finds polarity interactions by polarity (either polarity1 or polarity2), normalizing results
   * @param polarity - polarity name as string (e.g., 'Masculine', 'Feminine')
   * @returns Promise<PolarityInteraction[]> - Array of polarity interactions with queried polarity always as polarity1
   */
  async findByPolarity(polarity: string): Promise<PolarityInteraction[]> {
    logger.debug('Finding polarity interactions by polarity', { polarity }, 'PolarityInteractionsService');

    try {
      // Find interactions where polarity appears in either position
      const sortObj: any = {};
      sortObj['polarity2'] = 1; // Sort by the second polarity alphabetically
      const interactions = await this.polarityInteractionModel
        .find({
          $or: [
            { polarity1: polarity },
            { polarity2: polarity }
          ]
        })
        .sort(sortObj)
        .exec();

      logger.debug('Polarity interactions found for polarity', {
        polarity,
        count: interactions.length
      }, 'PolarityInteractionsService');

      // Transform results to normalize queried polarity as polarity1
      return interactions.map(interaction => {
        const transformed = this.transformToInterface(interaction);
        
        // If the queried polarity is polarity2, swap them
        if (transformed.polarity2 === polarity && transformed.polarity1 !== polarity) {
          return {
            ...transformed,
            polarity1: transformed.polarity2,
            polarity2: transformed.polarity1
          };
        }
        
        return transformed;
      });
    } catch (error) {
      logger.error('Failed to find polarity interactions by polarity', {
        polarity,
        error
      }, 'PolarityInteractionsService');

      return [];
    }
  }

  /**
   * Finds polarity interaction by two specific polarities
   * @param polarity1 - First polarity name
   * @param polarity2 - Second polarity name
   * @returns Promise<PolarityInteraction | null> - Interaction if found, null if not found
   */
  async findByPolarities(polarity1: string, polarity2: string): Promise<PolarityInteraction | null> {
    logger.debug('Finding polarity interaction by polarities', { polarity1, polarity2 }, 'PolarityInteractionsService');

    try {
      // Find interaction where both polarities match (in either order)
      const interaction = await this.polarityInteractionModel
        .findOne({
          $or: [
            { polarity1: polarity1, polarity2: polarity2 },
            { polarity1: polarity2, polarity2: polarity1 }
          ]
        })
        .exec();

      if (!interaction) {
        logger.debug('Polarity interaction not found', { polarity1, polarity2 }, 'PolarityInteractionsService');
        return null;
      }

      logger.debug('Polarity interaction found', {
        polarity1,
        polarity2,
        foundPolarity1: interaction.polarity1,
        foundPolarity2: interaction.polarity2
      }, 'PolarityInteractionsService');

      return this.transformToInterface(interaction);
    } catch (error) {
      logger.error('Failed to find polarity interaction by polarities', {
        polarity1,
        polarity2,
        error
      }, 'PolarityInteractionsService');

      return null;
    }
  }

  /**
   * Finds polarity interactions by dynamic
   * @param dynamic - dynamic name as string
   * @returns Promise<PolarityInteraction[]> - Array of polarity interactions
   */
  async findByDynamic(dynamic: string): Promise<PolarityInteraction[]> {
    logger.debug('Finding polarity interactions by dynamic', { dynamic }, 'PolarityInteractionsService');

    try {
      const sortObj: any = {};
      sortObj['polarity1'] = 1;
      const interactions = await this.polarityInteractionModel
        .find({ dynamic: dynamic })
        .sort(sortObj)
        .exec();

      logger.debug('Polarity interactions found for dynamic', {
        dynamic,
        count: interactions.length
      }, 'PolarityInteractionsService');

      return interactions.map(interaction => {
        const transformed = this.transformToInterface(interaction);
        return transformed;
      });
    } catch (error) {
      logger.error('Failed to find polarity interactions by dynamic', {
        dynamic,
        error
      }, 'PolarityInteractionsService');

      return [];
    }
  }

  /**
   * @returns number - Retrieves polarity interaction records total
   */
  async getTotal(): Promise<number> {
    return await this.polarityInteractionModel.countDocuments();
  }

  /**
   * Retrieves polarity interactions with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<PolarityInteraction[]> - Array of polarity interactions with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<PolarityInteraction[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding polarity interactions with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'PolarityInteractionsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const interactions = await this.polarityInteractionModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Polarity interactions found', { 
      count: interactions.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'PolarityInteractionsService');
    
    return interactions.map(interaction => this.transformToInterface(interaction));
  }

  /**
   * Transforms MongoDB document to clean PolarityInteraction interface
   * @param doc - MongoDB polarity interaction document
   * @returns PolarityInteraction - Clean polarity interaction object
   */
  private transformToInterface(doc: PolarityInteractionDocument): PolarityInteraction {
    return {
      _id: doc._id?.toString(),
      polarity1: doc.polarity1 as any,
      polarity2: doc.polarity2 as any,
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