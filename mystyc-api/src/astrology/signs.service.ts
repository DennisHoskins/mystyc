import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { SignDocument } from './schemas/sign.schema';

@Injectable()
export class SignsService {
  constructor(
    @InjectModel('Sign') private signModel: Model<SignDocument>
  ) {}

  /**
   * @returns number - Retrieves sign records total
   */
  async getTotal(): Promise<number> {
    return await this.signModel.countDocuments();
  }

  /**
   * Retrieves signs with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<any[]> - Array of signs with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<any[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding signs with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'SignsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const signs = await this.signModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Signs found', { 
      count: signs.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'SignsService');
    
    return signs.map(sign => this.transformToInterface(sign));
  }

  /**
   * Transforms MongoDB document to clean interface
   * @param doc - MongoDB sign document
   * @returns any - Clean sign object
   */
  private transformToInterface(doc: SignDocument): any {
    return {
      _id: doc._id?.toString(),
      sign: doc.sign,
      element: doc.element,
      modality: doc.modality,
      description: doc.description,
      keywords: doc.keywords,
      energyType: doc.energyType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}