import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { Polarity } from 'mystyc-common/index';

import { logger } from '@/common/util/logger';
import { PolarityDocument } from '../schemas/polarity.schema';

@Injectable()
export class PolaritiesService {
  constructor(
    @InjectModel('Polarity') private polarityModel: Model<PolarityDocument>
  ) {}

  /**
   * Finds polarity by name, returns null if not found (admin use)
   * @param polarity - polarity name as string
   * @returns Promise<Polarity | null> - Polarity if found, null if not found
   */
  async findByName(name: string): Promise<Polarity | null> {
    logger.debug('Finding polarity by name', { name }, 'PolaritiesService');

    try {
      const polarity = await this.polarityModel.findOne({ polarity: name });

      if (!polarity) {
        logger.debug('Polarity not found', { name }, 'PolaritiesService');
        return null;
      }

      logger.debug('Polarity found', {
        polarity: polarity.polarity,
      }, 'PolaritiesService');

      return this.transformToInterface(polarity);
    } catch (error) {
      logger.error('Failed to find polarity by name', {
        name,
        error
      }, 'PolaritiesService');

      return null;
    }
  }

  /**
   * @returns number - Retrieves polarity records total
   */
  async getTotal(): Promise<number> {
    return await this.polarityModel.countDocuments();
  }

  /**
   * Retrieves polarities with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<Polarity[]> - Array of polarities with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<Polarity[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding polarities with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'PolaritiesService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const polarities = await this.polarityModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Polarities found', { 
      count: polarities.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'PolaritiesService');
    
    return polarities.map(polarity => this.transformToInterface(polarity));
  }

  /**
   * Transforms MongoDB document to clean interface
   * @param doc - MongoDB polarity document
   * @returns Polarity - Clean polarity object
   */
  private transformToInterface(doc: PolarityDocument): Polarity {
    return {
      _id: doc._id?.toString(),
      polarity: doc.polarity as any,
      alternativeName: doc.alternativeName as any,
      description: doc.description,
      keywords: doc.keywords,
      energyType: doc.energyType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}