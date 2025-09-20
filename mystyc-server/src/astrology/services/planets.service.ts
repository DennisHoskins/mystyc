import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';
import { Planet } from 'mystyc-common/schemas';

import { logger } from '@/common/util/logger';
import { PlanetDocument } from '../schemas/planet.schema';

@Injectable()
export class PlanetsService {
  constructor(
    @InjectModel('Planet') private planetModel: Model<PlanetDocument>
  ) {}

  /**
   * Finds planet by name, returns null if not found (admin use)
   * @param planet - planet name as string
   * @returns Promise<Planet | null> - Planet if found, null if not found
   */
  async findByName(name: string): Promise<Planet | null> {
    logger.debug('Finding planet by name', { name }, 'PlanetsService');

    try {
      const planet = await this.planetModel.findOne({ planet: name });

      if (!planet) {
        logger.debug('Planet not found', { name }, 'PlanetsService');
        return null;
      }

      logger.debug('Planet found', {
        planet: planet.planet,
      }, 'PlanetsService');

      return this.transformToInterface(planet);
    } catch (error) {
      logger.error('Failed to find planet by name', {
        name,
        error
      }, 'PlanetsService');

      return null;
    }
  }

  /**
   * @returns number - Retrieves planet records total
   */
  async getTotal(): Promise<number> {
    return await this.planetModel.countDocuments();
  }

  /**
   * Retrieves planets with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<any[]> - Array of planets with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<any[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding planets with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'PlanetsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const planets = await this.planetModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Planets found', { 
      count: planets.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'PlanetsService');
    
    return planets.map(planet => this.transformToInterface(planet));
  }

  /**
   * Transforms MongoDB document to clean interface
   * @param doc - MongoDB planet document
   * @returns any - Clean planet object
   */
  private transformToInterface(doc: PlanetDocument): any {
    return {
      _id: doc._id?.toString(),
      planet: doc.planet,
      description: doc.description,
      keywords: doc.keywords,
      importance: doc.importance,
      energyType: doc.energyType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}