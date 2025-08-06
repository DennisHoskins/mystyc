import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PlanetInteraction } from 'mystyc-common/schemas';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { PlanetInteractionDocument } from './schemas/planet-interaction.schema';

@Injectable()
export class PlanetInteractionsService {
  constructor(
    @InjectModel('PlanetInteraction') private planetInteractionModel: Model<PlanetInteractionDocument>
  ) {}

  /**
   * @returns number - Retrieves planet interaction records total
   */
  async getTotal(): Promise<number> {
    return await this.planetInteractionModel.countDocuments();
  }

  /**
   * Retrieves planet interactions with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<PlanetInteraction[]> - Array of planet interactions with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<PlanetInteraction[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding planet interactions with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'PlanetInteractionsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const interactions = await this.planetInteractionModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Planet interactions found', { 
      count: interactions.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'PlanetInteractionsService');
    
    return interactions.map(interaction => this.transformToInterface(interaction));
  }

  /**
   * Transforms MongoDB document to clean PlanetInteraction interface
   * @param doc - MongoDB planet interaction document
   * @returns PlanetInteraction - Clean planet interaction object
   */
  private transformToInterface(doc: PlanetInteractionDocument): PlanetInteraction {
    return {
      _id: doc._id?.toString(),
      planet1: doc.planet1 as any,
      planet2: doc.planet2 as any,
      dynamic: doc.dynamic as any,
      description: doc.description,
      keywords: doc.keywords,
      energyType: doc.energyType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}