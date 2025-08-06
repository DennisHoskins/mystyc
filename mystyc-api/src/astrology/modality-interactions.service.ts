import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ModalityInteraction } from 'mystyc-common/schemas';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { ModalityInteractionDocument } from './schemas/modality-interaction.schema';

@Injectable()
export class ModalityInteractionsService {
  constructor(
    @InjectModel('ModalityInteraction') private modalityInteractionModel: Model<ModalityInteractionDocument>
  ) {}

  /**
   * @returns number - Retrieves modality interaction records total
   */
  async getTotal(): Promise<number> {
    return await this.modalityInteractionModel.countDocuments();
  }

  /**
   * Retrieves modality interactions with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<ModalityInteraction[]> - Array of modality interactions with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<ModalityInteraction[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding modality interactions with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'ModalityInteractionsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const interactions = await this.modalityInteractionModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Modality interactions found', { 
      count: interactions.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'ModalityInteractionsService');
    
    return interactions.map(interaction => this.transformToInterface(interaction));
  }

  /**
   * Transforms MongoDB document to clean ModalityInteraction interface
   * @param doc - MongoDB modality interaction document
   * @returns ModalityInteraction - Clean modality interaction object
   */
  private transformToInterface(doc: ModalityInteractionDocument): ModalityInteraction {
    return {
      _id: doc._id?.toString(),
      modality1: doc.modality1 as any,
      modality2: doc.modality2 as any,
      dynamic: doc.dynamic as any,
      description: doc.description,
      keywords: doc.keywords,
      energyType: doc.energyType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}