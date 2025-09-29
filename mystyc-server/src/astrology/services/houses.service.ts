import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { House } from 'mystyc-common/index';

import { logger } from '@/common/util/logger';
import { HouseDocument } from '../schemas/house.schema';

@Injectable()
export class HousesService {
  constructor(
    @InjectModel('House') private houseModel: Model<HouseDocument>
  ) {}

  /**
   * Finds house by number, returns null if not found
   * @param houseNumber - house number (1-12)
   * @returns Promise<House | null> - House if found, null if not found
   */
  async findByNumber(houseNumber: number): Promise<House | null> {
    logger.debug('Finding house by number', { houseNumber }, 'HousesService');

    try {
      const house = await this.houseModel.findOne({ houseNumber });

      if (!house) {
        logger.debug('House not found', { houseNumber }, 'HousesService');
        return null;
      }

      logger.debug('House found', {
        houseNumber: house.houseNumber,
        name: house.name
      }, 'HousesService');

      return this.transformToInterface(house);
    } catch (error) {
      logger.error('Failed to find house by number', {
        houseNumber,
        error
      }, 'HousesService');

      return null;
    }
  }

  /**
   * Finds houses by natural ruler sign
   * @param naturalRuler - sign name as string
   * @returns Promise<House[]> - Array of houses for that natural ruler
   */
  async findByNaturalRuler(naturalRuler: string): Promise<House[]> {
    logger.debug('Finding houses by natural ruler', { naturalRuler }, 'HousesService');

    try {
      const houses = await this.houseModel.find({ naturalRuler }).exec();

      logger.debug('Houses found by natural ruler', {
        naturalRuler,
        count: houses.length
      }, 'HousesService');

      return houses.map(house => this.transformToInterface(house));
    } catch (error) {
      logger.error('Failed to find houses by natural ruler', {
        naturalRuler,
        error
      }, 'HousesService');

      return [];
    }
  }

  /**
   * @returns number - Retrieves house records total
   */
  async getTotal(): Promise<number> {
    return await this.houseModel.countDocuments();
  }

  /**
   * Retrieves houses with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<House[]> - Array of houses with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<House[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding houses with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'HousesService');

    // Build sort object - default to houseNumber if not specified
    const sortObj: any = {};
    sortObj[sortBy || 'houseNumber'] = sortOrder === 'asc' ? 1 : -1;

    const houses = await this.houseModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Houses found', { 
      count: houses.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'HousesService');
    
    return houses.map(house => this.transformToInterface(house));
  }

  /**
   * Transforms MongoDB document to clean interface
   * @param doc - MongoDB house document
   * @returns House - Clean house object
   */
  private transformToInterface(doc: HouseDocument): House {
    return {
      _id: doc._id?.toString(),
      houseNumber: doc.houseNumber,
      name: doc.name,
      naturalRuler: doc.naturalRuler as any,
      lifeArea: doc.lifeArea,
      description: doc.description,
      keywords: doc.keywords,
      energyType: doc.energyType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}