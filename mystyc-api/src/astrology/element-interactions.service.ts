import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ElementInteraction } from 'mystyc-common/schemas';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { ElementInteractionDocument } from './schemas/element-interaction.schema';

@Injectable()
export class ElementInteractionsService {
  constructor(
    @InjectModel('ElementInteraction') private elementInteractionModel: Model<ElementInteractionDocument>
  ) {}

  /**
   * @returns number - Retrieves element interaction records total
   */
  async getTotal(): Promise<number> {
    return await this.elementInteractionModel.countDocuments();
  }

  /**
   * Retrieves element interactions with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<ElementInteraction[]> - Array of element interactions with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<ElementInteraction[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding element interactions with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'ElementInteractionsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const interactions = await this.elementInteractionModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Element interactions found', { 
      count: interactions.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'ElementInteractionsService');
    
    return interactions.map(interaction => this.transformToInterface(interaction));
  }

  /**
   * Transforms MongoDB document to clean ElementInteraction interface
   * @param doc - MongoDB element interaction document
   * @returns ElementInteraction - Clean element interaction object
   */
  private transformToInterface(doc: ElementInteractionDocument): ElementInteraction {
    return {
      _id: doc._id?.toString(),
      element1: doc.element1 as any,
      element2: doc.element2 as any,
      dynamic: doc.dynamic as any,
      description: doc.description,
      keywords: doc.keywords,
      energyType: doc.energyType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}