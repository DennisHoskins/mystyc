import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { EnergyTypeDocument } from './schemas/energy-type.schema';

@Injectable()
export class EnergyTypesService {
  constructor(
    @InjectModel('EnergyType') private energyTypeModel: Model<EnergyTypeDocument>
  ) {}

  /**
   * @returns number - Retrieves energy type records total
   */
  async getTotal(): Promise<number> {
    return await this.energyTypeModel.countDocuments();
  }

  /**
   * Retrieves energy types with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<any[]> - Array of energy types with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<any[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding energy types with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'EnergyTypesService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const energyTypes = await this.energyTypeModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Energy types found', { 
      count: energyTypes.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'EnergyTypesService');
    
    return energyTypes.map(energyType => this.transformToInterface(energyType));
  }

  /**
   * Transforms MongoDB document to clean interface
   * @param doc - MongoDB energy type document
   * @returns any - Clean energy type object
   */
  private transformToInterface(doc: EnergyTypeDocument): any {
    return {
      _id: doc._id?.toString(),
      energyType: doc.energyType,
      description: doc.description,
      keywords: doc.keywords,
      category: doc.category,
      intensity: doc.intensity,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}