import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PlanetaryPosition } from 'mystyc-common/schemas';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { PlanetaryPositionDocument } from './schemas/planetary-position.schema';

@Injectable()
export class PlanetaryPositionsService {
  constructor(
    @InjectModel('PlanetaryPosition') private planetaryPositionModel: Model<PlanetaryPositionDocument>
  ) {}

  /**
   * @returns number - Retrieves planetary position records total
   */
  async getTotal(): Promise<number> {
    return await this.planetaryPositionModel.countDocuments();
  }

  /**
   * Retrieves planetary positions with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<PlanetaryPosition[]> - Array of planetary positions with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<PlanetaryPosition[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding planetary positions with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'PlanetaryPositionsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const positions = await this.planetaryPositionModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Planetary positions found', { 
      count: positions.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'PlanetaryPositionsService');
    
    return positions.map(position => this.transformToInterface(position));
  }

  /**
   * Transforms MongoDB document to clean PlanetaryPosition interface
   * @param doc - MongoDB planetary position document
   * @returns PlanetaryPosition - Clean planetary position object
   */
  private transformToInterface(doc: PlanetaryPositionDocument): PlanetaryPosition {
    return {
      _id: doc._id?.toString(),
      planet: doc.planet as any,
      sign: doc.sign as any,
      description: doc.description,
      keywords: doc.keywords,
      energyType: doc.energyType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}