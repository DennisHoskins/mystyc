import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ElementInteraction } from 'mystyc-common/schemas';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { ElementInteractionDocument } from '../schemas/element-interaction.schema';

@Injectable()
export class ElementInteractionsService {
  constructor(
    @InjectModel('ElementInteraction') private elementInteractionModel: Model<ElementInteractionDocument>
  ) {}

  /**
   * Finds element interaction by ID, returns null if not found (admin use)
   * @param id - MongoDB ObjectId as string
   * @returns Promise<ElementInteraction | null> - ElementInteraction if found, null if not found
   */
  async findById(id: string): Promise<ElementInteraction | null> {
    logger.debug('Finding element interaction by ID', { id }, 'ElementInteractionsService');

    try {
      const interaction = await this.elementInteractionModel.findById(id).exec();

      if (!interaction) {
        logger.debug('Element interaction not found', { id }, 'ElementInteractionsService');
        return null;
      }

      logger.debug('Element interaction found', {
        id,
        element1: interaction.element1,
        element2: interaction.element2
      }, 'ElementInteractionsService');

      return this.transformToInterface(interaction);
    } catch (error) {
      logger.error('Failed to find element interaction by ID', {
        id,
        error
      }, 'ElementInteractionsService');

      return null;
    }
  }

  /**
   * Finds element interactions by element (either element1 or element2), normalizing results
   * @param element - Element name to search for
   * @returns Promise<ElementInteraction[]> - Array of interactions with queried element always as element1
   */
  async findByElement(element: string): Promise<ElementInteraction[]> {
    logger.debug('Finding element interactions by element', { element }, 'ElementInteractionsService');

    try {
      // Find interactions where element appears in either position
      const interactions = await this.elementInteractionModel
        .find({
          $or: [
            { element1: element },
            { element2: element }
          ]
        })
        .exec();

      logger.debug('Element interactions found', {
        element,
        count: interactions.length
      }, 'ElementInteractionsService');

      // Transform results to normalize queried element as element1
      return interactions.map(interaction => {
        const transformed = this.transformToInterface(interaction);
        
        // If the queried element is element2, swap them
        if (transformed.element2 === element && transformed.element1 !== element) {
          return {
            ...transformed,
            element1: transformed.element2,
            element2: transformed.element1
          };
        }
        
        return transformed;
      });
    } catch (error) {
      logger.error('Failed to find element interactions by element', {
        element,
        error
      }, 'ElementInteractionsService');

      return [];
    }
  }

  /**
   * Finds element interaction by two specific elements
   * @param element1 - First element name
   * @param element2 - Second element name
   * @returns Promise<ElementInteraction | null> - Interaction if found, null if not found
   */
  async findByElements(element1: string, element2: string): Promise<ElementInteraction | null> {
    logger.debug('Finding element interaction by elements', { element1, element2 }, 'ElementInteractionsService');

    try {
      // Find interaction where both elements match (in either order)
      const interaction = await this.elementInteractionModel
        .findOne({
          $or: [
            { element1: element1, element2: element2 },
            { element1: element2, element2: element1 }
          ]
        })
        .exec();

      if (!interaction) {
        logger.debug('Element interaction not found', { element1, element2 }, 'ElementInteractionsService');
        return null;
      }

      logger.debug('Element interaction found', {
        element1,
        element2,
        foundElement1: interaction.element1,
        foundElement2: interaction.element2
      }, 'ElementInteractionsService');

      return this.transformToInterface(interaction);
    } catch (error) {
      logger.error('Failed to find element interaction by elements', {
        element1,
        element2,
        error
      }, 'ElementInteractionsService');

      return null;
    }
  }

  /**
   * Finds element interactions by dynamic
   * @param dynamic - Dynamic name to search for
   * @returns Promise<ElementInteraction[]> - Array of interactions
   */
  async findByDynamic(dynamic: string): Promise<ElementInteraction[]> {
    logger.debug('Finding element interactions by dynamic', { dynamic }, 'ElementInteractionsService');

    try {
      // Find interactions where element appears in either position
      const sortObj: any = {};
      sortObj['element1'] = 1;
      const interactions = await this.elementInteractionModel
        .find({ dynamic: dynamic })
        .sort(sortObj)
        .exec();

      logger.debug('Element interactions found', {
        dynamic,
        count: interactions.length
      }, 'ElementInteractionsService');

      // Transform results to normalize queried element as element1
      return interactions.map(interaction => {
        const transformed = this.transformToInterface(interaction);
        return transformed;
      });
    } catch (error) {
      logger.error('Failed to find element interactions by dynamic', {
        dynamic,
        error
      }, 'ElementInteractionsService');

      return [];
    }
  }

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
      action: doc.action,
      keywords: doc.keywords,
      energyType: doc.energyType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}