import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { Dynamic } from 'mystyc-common/schemas';

import { logger } from '@/common/util/logger';
import { DynamicDocument } from '../schemas/dynamic.schema';

@Injectable()
export class DynamicsService {
  constructor(
    @InjectModel('Dynamic') private dynamicModel: Model<DynamicDocument>
  ) {}

  /**
   * Finds dynamic by name, returns null if not found (admin use)
   * @param dynamic - dynamic name as string
   * @returns Promise<Dynamic | null> - Dynamic if found, null if not found
   */
  async findByName(name: string): Promise<Dynamic | null> {
    logger.debug('Finding dynamic by name', { name }, 'DynamicsService');

    try {
      const dynamic = await this.dynamicModel.findOne({ dynamic: name });

      if (!dynamic) {
        logger.debug('Dynamic not found', { name }, 'DynamicsService');
        return null;
      }

      logger.debug('Dynamic found', {
        dynamic: dynamic.dynamic,
      }, 'DynamicsService');

      return this.transformToInterface(dynamic);
    } catch (error) {
      logger.error('Failed to find dynamic by name', {
        name,
        error
      }, 'DynamicsService');

      return null;
    }
  }

  /**
   * @returns number - Retrieves dynamic records total
   */
  async getTotal(): Promise<number> {
    return await this.dynamicModel.countDocuments();
  }

  /**
   * Retrieves dynamics with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<any[]> - Array of dynamics with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<any[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding dynamics with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'DynamicsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const dynamics = await this.dynamicModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Dynamics found', { 
      count: dynamics.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'DynamicsService');
    
    return dynamics.map(dynamic => this.transformToInterface(dynamic));
  }

  /**
   * Transforms MongoDB document to clean interface
   * @param doc - MongoDB dynamic document
   * @returns any - Clean dynamic object
   */
  private transformToInterface(doc: DynamicDocument): any {
    return {
      _id: doc._id?.toString(),
      dynamic: doc.dynamic,
      description: doc.description,
      keywords: doc.keywords,
      scoreValue: doc.scoreValue,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}