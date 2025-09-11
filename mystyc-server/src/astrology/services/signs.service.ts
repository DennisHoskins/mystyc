import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { ElementType, ModalityType, Sign, SignBasics, SignComplete, ZodiacSignType } from 'mystyc-common/index';

import { logger } from '@/common/util/logger';
import { SignDocument } from '../schemas/sign.schema';

@Injectable()
export class SignsService {
  constructor(
    @InjectModel('Sign') private signModel: Model<SignDocument>
  ) {}

  /**
   * Finds sign by name, returns null if not found (admin use)
   * @param sign - sign name as string
   * @returns Promise<Sign | null> - Sign if found, null if not found
   */
  async findByName(name: string): Promise<Sign | null> {
    logger.debug('Finding sign by name', { name }, 'SignsService');

    try {
      const sign = await this.signModel.findOne({ 
        sign: { $regex: new RegExp(`^${name}$`, 'i') } 
      });
      
      if (!sign) {
        logger.debug('Sign not found', { name }, 'SignsService');
        return null;
      }

      logger.debug('Sign found', {
        sign: sign.sign,
      }, 'SignsService');

      return this.transformToInterface(sign);
    } catch (error) {
      logger.error('Failed to find sign by name', {
        name,
        error
      }, 'SignsService');

      return null;
    }
  }

  /**
   * Finds all signs by element
   * @param element - element name as string
   * @returns Promise<Sign[]> - Array of signs for that element
   */
  async findByElement(element: string): Promise<Sign[]> {
    logger.debug('Finding signs by element', { element }, 'SignsService');

    try {
      const signs = await this.signModel.find({ element: element }).exec();

      logger.debug('Signs found by element', {
        element,
        count: signs.length
      }, 'SignsService');

      return signs.map(sign => this.transformToInterface(sign));
    } catch (error) {
      logger.error('Failed to find signs by element', {
        element,
        error
      }, 'SignsService');

      return [];
    }
  }

  /**
   * Finds all signs by modality
   * @param modality - modality name as string
   * @returns Promise<Sign[]> - Array of signs for that modality
   */
  async findByModality(modality: string): Promise<Sign[]> {
    logger.debug('Finding signs by modality', { modality }, 'SignsService');

    try {
      const signs = await this.signModel.find({ modality: modality }).exec();

      logger.debug('Signs found by modality', {
        modality,
        count: signs.length
      }, 'SignsService');

      return signs.map(sign => this.transformToInterface(sign));
    } catch (error) {
      logger.error('Failed to find signs by modality', {
        modality,
        error
      }, 'SignsService');

      return [];
    }
  }

  /**
   * @returns number - Retrieves sign records total
   */
  async getTotal(): Promise<number> {
    return await this.signModel.countDocuments();
  }

  /**
   * Retrieves signs with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<Sign[]> - Array of signs with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<Sign[]> {
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
   * @returns Sign - Clean sign object with all nested data
   */
  private transformToInterface(doc: SignDocument): Sign {
    return {
      _id: doc._id?.toString(),
      sign: doc.sign as ZodiacSignType,
      element: doc.element as ElementType,
      modality: doc.modality as ModalityType,
      description: doc.description,
      keywords: doc.keywords,
      energyType: doc.energyType,
      basics: doc.basics as SignBasics,
      timing: doc.timing,
      symbol: doc.symbol,
      gems: doc.gems,
      lucky: doc.lucky,
      physical: doc.physical,
      lifestyle: doc.lifestyle,
      tarot: doc.tarot,
      aesthetic: doc.aesthetic,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}