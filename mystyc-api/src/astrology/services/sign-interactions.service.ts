import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SignInteraction } from 'mystyc-common/schemas';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { SignInteractionDocument } from '../schemas/sign-interaction.schema';

@Injectable()
export class SignInteractionsService {
  constructor(
    @InjectModel('SignInteraction') private signInteractionModel: Model<SignInteractionDocument>
  ) {}

  /**
   * Finds sign interaction by ID, returns null if not found (admin use)
   * @param id - MongoDB ObjectId as string
   * @returns Promise<SignInteraction | null> - SignInteraction if found, null if not found
   */
  async findById(id: string): Promise<SignInteraction | null> {
    logger.debug('Finding sign interaction by ID', { id }, 'SignInteractionsService');

    try {
      const interaction = await this.signInteractionModel.findById(id).exec();

      if (!interaction) {
        logger.debug('Sign interaction not found', { id }, 'SignInteractionsService');
        return null;
      }

      logger.debug('Sign interaction found', {
        id,
        sign1: interaction.sign1,
        sign2: interaction.sign2
      }, 'SignInteractionsService');

      return this.transformToInterface(interaction);
    } catch (error) {
      logger.error('Failed to find sign interaction by ID', {
        id,
        error
      }, 'SignInteractionsService');

      return null;
    }
  }

  /**
   * Finds sign interactions by sign (only when sign is in sign1 position)
   * @param sign - Sign name to search for
   * @returns Promise<SignInteraction[]> - Array of interactions where sign is sign1
   */
  async findBySign(sign: string): Promise<SignInteraction[]> {
    logger.debug('Finding sign interactions by sign', { sign }, 'SignInteractionsService');

    try {
      // Find interactions where sign is in sign1 position only
      const interactions = await this.signInteractionModel
        .find({ sign1: sign })
        .sort({ totalScore: -1 })
        .exec();

      logger.debug('Sign interactions found', {
        sign,
        count: interactions.length
      }, 'SignInteractionsService');

      return interactions.map(interaction => this.transformToInterface(interaction));
    } catch (error) {
      logger.error('Failed to find sign interactions by sign', {
        sign,
        error
      }, 'SignInteractionsService');

      return [];
    }
  }

  /**
   * Finds sign interaction by two specific signs
   * @param sign1 - First sign name
   * @param sign2 - Second sign name
   * @returns Promise<SignInteraction | null> - Interaction if found, null if not found
   */
  async findBySigns(sign1: string, sign2: string): Promise<SignInteraction | null> {
    logger.debug('Finding sign interaction by signs', { sign1, sign2 }, 'SignInteractionsService');

    try {
      // Find interaction with exact sign order (directional)
      const interaction = await this.signInteractionModel
        .findOne({ sign1: sign1, sign2: sign2 })
        .exec();

      if (!interaction) {
        logger.debug('Sign interaction not found', { sign1, sign2 }, 'SignInteractionsService');
        return null;
      }

      logger.debug('Sign interaction found', {
        sign1,
        sign2,
        totalScore: interaction.totalScore
      }, 'SignInteractionsService');

      return this.transformToInterface(interaction);
    } catch (error) {
      logger.error('Failed to find sign interaction by signs', {
        sign1,
        sign2,
        error
      }, 'SignInteractionsService');

      return null;
    }
  }

  /**
   * Finds sign interactions by dynamic
   * @param dynamic - Dynamic name to search for
   * @returns Promise<SignInteraction[]> - Array of interactions
   */
  async findByDynamic(dynamic: string): Promise<SignInteraction[]> {
    logger.debug('Finding sign interactions by dynamic', { dynamic }, 'SignInteractionsService');

    try {
      const sortObj: any = {};
      sortObj['sign1'] = 1;
      const interactions = await this.signInteractionModel
        .find({ dynamic: dynamic })
        .sort(sortObj)
        .exec();

      logger.debug('Sign interactions found', {
        dynamic,
        count: interactions.length
      }, 'SignInteractionsService');

      return interactions.map(interaction => this.transformToInterface(interaction));
    } catch (error) {
      logger.error('Failed to find sign interactions by dynamic', {
        dynamic,
        error
      }, 'SignInteractionsService');

      return [];
    }
  }

  /**
   * Finds top compatible signs for a given sign
   * @param sign - Sign name to find matches for
   * @param limit - Number of top matches to return (default 5)
   * @returns Promise<SignInteraction[]> - Array of top compatible interactions
   */
  async findTopCompatible(sign: string, limit: number = 5): Promise<SignInteraction[]> {
    logger.debug('Finding top compatible signs', { sign, limit }, 'SignInteractionsService');

    try {
      const interactions = await this.signInteractionModel
        .find({
          $or: [
            { sign1: sign },
            { sign2: sign }
          ]
        })
        .sort({ totalScore: -1 })
        .limit(limit)
        .exec();

      logger.debug('Top compatible signs found', {
        sign,
        count: interactions.length
      }, 'SignInteractionsService');

      return interactions.map(interaction => {
        const transformed = this.transformToInterface(interaction);
        
        // Normalize so queried sign is always sign1
        if (transformed.sign2 === sign && transformed.sign1 !== sign) {
          return {
            ...transformed,
            sign1: transformed.sign2,
            sign2: transformed.sign1
          };
        }
        
        return transformed;
      });
    } catch (error) {
      logger.error('Failed to find top compatible signs', {
        sign,
        error
      }, 'SignInteractionsService');

      return [];
    }
  }

  /**
   * @returns number - Retrieves sign interaction records total
   */
  async getTotal(): Promise<number> {
    return await this.signInteractionModel.countDocuments();
  }

  /**
   * Retrieves sign interactions with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<SignInteraction[]> - Array of sign interactions with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<SignInteraction[]> {
    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding sign interactions with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'SignInteractionsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const interactions = await this.signInteractionModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('Sign interactions found', { 
      count: interactions.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'SignInteractionsService');
    
    return interactions.map(interaction => this.transformToInterface(interaction));
  }

  /**
   * Transforms MongoDB document to clean SignInteraction interface
   * @param doc - MongoDB sign interaction document
   * @returns SignInteraction - Clean sign interaction object
   */
  private transformToInterface(doc: SignInteractionDocument): SignInteraction {
    return {
      _id: doc._id?.toString(),
      sign1: doc.sign1 as any,
      sign2: doc.sign2 as any,
      dynamic: doc.dynamic as any,
      description: doc.description,
      action: doc.action,
      keywords: doc.keywords,
      energyType: doc.energyType,
      distance: doc.distance,
      totalScore: doc.totalScore,
      elementScore: doc.elementScore,
      modalityScore: doc.modalityScore,
      dynamicScore: doc.dynamicScore,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}