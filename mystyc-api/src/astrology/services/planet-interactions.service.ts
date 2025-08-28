import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PlanetInteraction } from 'mystyc-common/schemas';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { PlanetInteractionDocument } from '../schemas/planet-interaction.schema';

@Injectable()
export class PlanetInteractionsService {
  constructor(
    @InjectModel('PlanetInteraction') private planetInteractionModel: Model<PlanetInteractionDocument>
  ) {}


  /**
   * Finds planet interaction by ID, returns null if not found (admin use)
   * @param id - MongoDB ObjectId as string
   * @returns Promise<PlanetInteraction | null> - PlanetInteraction if found, null if not found
   */
  async findById(id: string): Promise<PlanetInteraction | null> {
    logger.debug('Finding planet interaction by ID', { id }, 'PlanetInteractionsService');

    try {
      const interaction = await this.planetInteractionModel.findById(id);

      if (!interaction) {
        logger.debug('Planetary interaction not found', { id }, 'PlanetInteractionsService');
        return null;
      }

      logger.debug('Planetary interaction found', {
        id,
        planet: interaction.planet1,
        sign: interaction.planet2
      }, 'PlanetInteractionsService');

      return this.transformToInterface(interaction);
    } catch (error) {
      logger.error('Failed to find planet interaction by ID', {
        id,
        error
      }, 'PlanetInteractionsService');

      return null;
    }
  }

  /**
   * Finds planet interactions by planet (either planet1 or planet2), normalizing results
   * @param planet - planet name as string (e.g., 'Sun', 'Moon', etc.)
   * @returns Promise<PlanetInteraction[]> - Array of planet interactions with queried planet always as planet1
   */
  async findByPlanet(planet: string): Promise<PlanetInteraction[]> {
    logger.debug('Finding planet interactions by planet', { planet }, 'PlanetInteractionsService');

    try {
      // Find interactions where planet appears in either position
      const sortObj: any = {};
      sortObj['planet2'] = 1; // Sort by the second planet alphabetically
      const interactions = await this.planetInteractionModel
        .find({
          $or: [
            { planet1: planet },
            { planet2: planet }
          ]
        })
        .sort(sortObj)
        .exec();

      logger.debug('Planet interactions found for planet', {
        planet,
        count: interactions.length
      }, 'PlanetInteractionsService');

      // Transform results to normalize queried planet as planet1
      return interactions.map(interaction => {
        const transformed = this.transformToInterface(interaction);
        
        // If the queried planet is planet2, swap them
        if (transformed.planet2 === planet && transformed.planet1 !== planet) {
          return {
            ...transformed,
            planet1: transformed.planet2,
            planet2: transformed.planet1
          };
        }
        
        return transformed;
      });
    } catch (error) {
      logger.error('Failed to find planet interactions by planet', {
        planet,
        error
      }, 'PlanetInteractionsService');

      return [];
    }
  }

  /**
   * Finds planet interaction by two specific planets
   * @param planet1 - First planet name
   * @param planet2 - Second planet name
   * @returns Promise<PlanetInteraction | null> - Interaction if found, null if not found
   */
  async findByPlanets(planet1: string, planet2: string): Promise<PlanetInteraction | null> {
    logger.debug('Finding planet interaction by planets', { planet1, planet2 }, 'PlanetInteractionsService');

    try {
      // Find interaction where both planets match (in either order)
      const interaction = await this.planetInteractionModel
        .findOne({
          $or: [
            { planet1: planet1, planet2: planet2 },
            { planet1: planet2, planet2: planet1 }
          ]
        })
        .exec();

      if (!interaction) {
        logger.debug('Planet interaction not found', { planet1, planet2 }, 'PlanetInteractionsService');
        return null;
      }

      logger.debug('Planet interaction found', {
        planet1,
        planet2,
        foundPlanet1: interaction.planet1,
        foundPlanet2: interaction.planet2
      }, 'PlanetInteractionsService');

      return this.transformToInterface(interaction);
    } catch (error) {
      logger.error('Failed to find planet interaction by planets', {
        planet1,
        planet2,
        error
      }, 'PlanetInteractionsService');

      return null;
    }
  }

  /**
   * Finds planet interactions by dynamic
   * @param dynamic - dynamic name
   * @returns Promise<PlanetInteraction[]> - Array of planet interactions
   */
  async findByDynamic(dynamic: string): Promise<PlanetInteraction[]> {
    logger.debug('Finding planet interactions by dynamic', { dynamic }, 'PlanetInteractionsService');

    try {
      const sortObj: any = {};
      sortObj['planet1'] = 1;
      const interactions = await this.planetInteractionModel
        .find({ dynamic: dynamic })
        .sort(sortObj)
        .exec();

      logger.debug('Planet interactions found for dynamic', {
        dynamic,
        count: interactions.length
      }, 'PlanetInteractionsService');

      return interactions.map(interaction => {
        const transformed = this.transformToInterface(interaction);
        return transformed;
      });
    } catch (error) {
      logger.error('Failed to find planet interactions by dynamic', {
        dynamic,
        error
      }, 'PlanetInteractionsService');

      return [];
    }
  }

  /**
   * @returns number - Retrieves planet interaction records total
   */
  async getTotal(): Promise<number> {
    return await this.planetInteractionModel.countDocuments();
  }

  /**
   * Retrieves planet interactions with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<PlanetInteraction[]> - Array of planet interactions with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<PlanetInteraction[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding planet interactions with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'PlanetInteractionsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const interactions = await this.planetInteractionModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Planet interactions found', { 
      count: interactions.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'PlanetInteractionsService');
    
    return interactions.map(interaction => this.transformToInterface(interaction));
  }

  /**
   * Transforms MongoDB document to clean PlanetInteraction interface
   * @param doc - MongoDB planet interaction document
   * @returns PlanetInteraction - Clean planet interaction object
   */
  private transformToInterface(doc: PlanetInteractionDocument): PlanetInteraction {
    return {
      _id: doc._id?.toString(),
      planet1: doc.planet1 as any,
      planet2: doc.planet2 as any,
      dynamic: doc.dynamic as any,
      description: doc.description,
      action: doc.action,
      keywords: doc.keywords,
      energyType: doc.energyType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}