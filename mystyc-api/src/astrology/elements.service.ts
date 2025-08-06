import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { ElementDocument } from './schemas/element.schema';

@Injectable()
export class ElementsService {
  constructor(
    @InjectModel('Element') private elementModel: Model<ElementDocument>
  ) {}

  /**
   * @returns number - Retrieves element records total
   */
  async getTotal(): Promise<number> {
    return await this.elementModel.countDocuments();
  }

  /**
   * Retrieves elements with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<any[]> - Array of elements with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<any[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding elements with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'ElementsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const elements = await this.elementModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Elements found', { 
      count: elements.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'ElementsService');
    
    return elements.map(element => this.transformToInterface(element));
  }

  /**
   * Transforms MongoDB document to clean interface
   * @param doc - MongoDB element document
   * @returns any - Clean element object
   */
  private transformToInterface(doc: ElementDocument): any {
    return {
      _id: doc._id?.toString(),
      element: doc.element,
      description: doc.description,
      keywords: doc.keywords,
      energyType: doc.energyType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}