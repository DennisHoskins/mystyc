import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { Modality } from 'mystyc-common/schemas';

import { logger } from '@/common/util/logger';
import { ModalityDocument } from '../schemas/modality.schema';

@Injectable()
export class ModalitiesService {
  constructor(
    @InjectModel('Modality') private modalityModel: Model<ModalityDocument>
  ) {}

  /**
   * Finds modality by name, returns null if not found (admin use)
   * @param modality - modality name as string
   * @returns Promise<Modality | null> - Modality if found, null if not found
   */
  async findByName(name: string): Promise<Modality | null> {
    logger.debug('Finding modality by name', { name }, 'ModalitiesService');

    try {
      const modality = await this.modalityModel.findOne({ modality: name });

      if (!modality) {
        logger.debug('Modality not found', { name }, 'ModalitiesService');
        return null;
      }

      logger.debug('Modality found', {
        modality: modality.modality,
      }, 'ModalitiesService');

      return this.transformToInterface(modality);
    } catch (error) {
      logger.error('Failed to find modality by name', {
        name,
        error
      }, 'ModalitiesService');

      return null;
    }
  }

  /**
   * @returns number - Retrieves modality records total
   */
  async getTotal(): Promise<number> {
    return await this.modalityModel.countDocuments();
  }

  /**
   * Retrieves modalities with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<any[]> - Array of modalities with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<any[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding modalities with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'ModalitiesService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const modalities = await this.modalityModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Modalities found', { 
      count: modalities.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'ModalitiesService');
    
    return modalities.map(modality => this.transformToInterface(modality));
  }

  /**
   * Transforms MongoDB document to clean interface
   * @param doc - MongoDB modality document
   * @returns any - Clean modality object
   */
  private transformToInterface(doc: ModalityDocument): any {
    return {
      _id: doc._id?.toString(),
      modality: doc.modality,
      description: doc.description,
      keywords: doc.keywords,
      energyType: doc.energyType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}