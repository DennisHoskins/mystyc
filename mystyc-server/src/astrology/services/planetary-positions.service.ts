import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PlanetaryPosition } from 'mystyc-common/schemas';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { PlanetaryPositionDocument } from '../schemas/planetary-position.schema';

@Injectable()
export class PlanetaryPositionsService {
  constructor(
    @InjectModel('PlanetaryPosition') private planetaryPositionModel: Model<PlanetaryPositionDocument>
  ) {}

  /**
   * Finds planetary position by ID, returns null if not found (admin use)
   * @param id - MongoDB ObjectId as string
   * @returns Promise<PlanetaryPosition | null> - PlanetaryPosition if found, null if not found
   */
  async findById(id: string): Promise<PlanetaryPosition | null> {
    logger.debug('Finding planetary position by ID', { id }, 'PlanetaryPositionsService');

    try {
      const position = await this.planetaryPositionModel.findById(id);

      if (!position) {
        logger.debug('Planetary position not found', { id }, 'PlanetaryPositionsService');
        return null;
      }

      logger.debug('Planetary position found', {
        id,
        planet: position.planet,
        sign: position.sign
      }, 'PlanetaryPositionsService');

      return this.transformToInterface(position);
    } catch (error) {
      logger.error('Failed to find planetary position by ID', {
        id,
        error
      }, 'PlanetaryPositionsService');

      return null;
    }
  }


  /**
   * Finds planetary position by planet and sign
   * @param planet - Planet name to search for
   * @param sign - Zodiac sign name to search for
   * @returns Promise<PlanetaryPosition[]> - Array of interactions with queried element always as element1
   */
  async findByPosition(planet: string, sign: string): Promise<PlanetaryPosition | null> {
    logger.debug('Finding planetary position by planet and sign', { planet, sign }, 'PlanetaryPositionsService');

    try {
      const position = await this.planetaryPositionModel
        .findOne({ planet, sign })
        .exec();

      if (!position) {
        logger.error('Failed to find planetary position by planet and sign', {
          planet,
          sign,
        }, 'PlanetaryPositionsService');
        return null;
      }

      logger.debug('Planetary position found', {
        planet,
        sign,
      }, 'PlanetaryPositionsService');

      const transformed = this.transformToInterface(position);
      return transformed;
    } catch (error) {
      logger.error('Failed to find planetary position by planet and sign', {
        planet,
        sign,
        error
      }, 'PlanetaryPositionsService');

      return null;
    }
  }

  /**
   * Finds planetary positions by planet, returns empty array if none found (admin use)
   * @param planet - planet name as string (e.g., 'Sun', 'Moon', etc.)
   * @returns Promise<PlanetaryPosition[]> - Array of planetary positions for the planet
   */
  async findByPlanet(planet: string): Promise<PlanetaryPosition[]> {
    logger.debug('Finding planetary positions by planet', { planet }, 'PlanetaryPositionsService');

    try {

      const sortObj: any = {};
      sortObj['sign'] = 1;
      const positions = await this.planetaryPositionModel
        .find({ planet: planet })
        .sort(sortObj)
        .exec();

      logger.debug('Planetary positions found for planet', {
        planet,
        count: positions.length
      }, 'PlanetaryPositionsService');

      return positions.map(position => this.transformToInterface(position));
    } catch (error) {
      logger.error('Failed to find planetary positions by planet', {
        planet,
        error
      }, 'PlanetaryPositionsService');

      return [];
    }
  }

  /**
   * Finds planetary positions by zodiac sign, returns empty array if none found (admin use)
   * @param zodiacSign - zodiac sign name as string (e.g., 'Aries', 'Taurus', etc.)
   * @returns Promise<PlanetaryPosition[]> - Array of planetary positions for the zodiac sign
   */
  async findByZodiacSign(zodiacSign: string): Promise<PlanetaryPosition[]> {
    logger.debug('Finding planetary positions by zodiac sign', { zodiacSign }, 'PlanetaryPositionsService');

    try {

      const sortObj: any = {};
      sortObj['planet'] = 1;
      const positions = await this.planetaryPositionModel
        .find({ sign: zodiacSign })
        .sort(sortObj)
        .exec();

      logger.debug('Planetary positions found for zodiac sign', {
        zodiacSign,
        count: positions.length
      }, 'PlanetaryPositionsService');

      return positions.map(position => this.transformToInterface(position));
    } catch (error) {
      logger.error('Failed to find planetary positions by zodiac sign', {
        zodiacSign,
        error
      }, 'PlanetaryPositionsService');

      return [];
    }
  }

  /**
   * @returns number - Retrieves planetary position records total
   */
  async getTotal(): Promise<number> {
    return await this.planetaryPositionModel.countDocuments();
  }

  /**
   * Retrieves planetary positions with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<PlanetaryPosition[]> - Array of planetary positions with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<PlanetaryPosition[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding planetary positions with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'PlanetaryPositionsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy || 'planet'] = sortOrder === 'asc' ? 1 : -1;

    const positions = await this.planetaryPositionModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Planetary positions found', { 
      count: positions.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'PlanetaryPositionsService');
    
    return positions.map(position => this.transformToInterface(position));
  }

  /**
   * Transforms MongoDB document to clean PlanetaryPosition interface
   * @param doc - MongoDB planetary position document
   * @returns PlanetaryPosition - Clean planetary position object
   */
  private transformToInterface(doc: PlanetaryPositionDocument): PlanetaryPosition {
    return {
      _id: doc._id?.toString(),
      planet: doc.planet as any,
      sign: doc.sign as any,
      description: doc.description,
      keywords: doc.keywords,
      energyType: doc.energyType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}