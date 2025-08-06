import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AdminStatsQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { PlanetaryPositionsService } from '@/astrology/planetary-positions.service';
import { ElementInteractionsService } from '@/astrology/element-interactions.service';
import { ModalityInteractionsService } from '@/astrology/modality-interactions.service';
import { PlanetInteractionsService } from '@/astrology/planet-interactions.service';
import { PlanetaryPositionDocument } from '@/astrology/schemas/planetary-position.schema';
import { ElementInteractionDocument } from '@/astrology/schemas/element-interaction.schema';
import { ModalityInteractionDocument } from '@/astrology/schemas/modality-interaction.schema';
import { PlanetInteractionDocument } from '@/astrology/schemas/planet-interaction.schema';
import { RegisterStatsModule } from '@/admin/stats/stats-registry';

export interface AstrologySummaryStats {
  totalPlanetaryPositions: number;
  totalElementInteractions: number;
  totalModalityInteractions: number;
  totalPlanetInteractions: number;
  planetaryPositionsByElement: Array<{
    element: string;
    count: number;
    percentage: number;
  }>;
  planetaryPositionsByModality: Array<{
    modality: string;
    count: number;
    percentage: number;
  }>;
}

export interface AstrologyInteractionStats {
  elementDynamics: Array<{
    dynamic: string;
    count: number;
    percentage: number;
  }>;
  modalityDynamics: Array<{
    dynamic: string;
    count: number;
    percentage: number;
  }>;
  planetDynamics: Array<{
    dynamic: string;
    count: number;
    percentage: number;
  }>;
  mostCommonDynamic: string;
}

export interface AstrologyKnowledgeDistributionStats {
  planetDistribution: Array<{
    planet: string;
    positionsCount: number;
    interactionsCount: number;
    totalReferences: number;
  }>;
  signDistribution: Array<{
    sign: string;
    count: number;
    percentage: number;
  }>;
  averageKeywordsPerEntry: number;
  totalUniqueKeywords: number;
}

@RegisterStatsModule({
  serviceName: 'Astrology',
  service: AdminAstrologyStatsService,
  stats: [
    { key: 'summary', method: 'getSummaryStats' },
    { key: 'interactions', method: 'getInteractionStats' },
    { key: 'distribution', method: 'getKnowledgeDistributionStats' }
  ]
})
@Injectable()
export class AdminAstrologyStatsService {
  constructor(
    @InjectModel('PlanetaryPosition') private planetaryPositionModel: Model<PlanetaryPositionDocument>,
    @InjectModel('ElementInteraction') private elementInteractionModel: Model<ElementInteractionDocument>,
    @InjectModel('ModalityInteraction') private modalityInteractionModel: Model<ModalityInteractionDocument>,
    @InjectModel('PlanetInteraction') private planetInteractionModel: Model<PlanetInteractionDocument>,
    private readonly planetaryPositionsService: PlanetaryPositionsService,
    private readonly elementInteractionsService: ElementInteractionsService,
    private readonly modalityInteractionsService: ModalityInteractionsService,
    private readonly planetInteractionsService: PlanetInteractionsService,
  ) {}

  async getSummaryStats(query?: AdminStatsQuery): Promise<AstrologySummaryStats> {
    logger.info('Generating astrology summary stats', { query }, 'AdminAstrologyStatsService');
    
    try {
      // Get total counts
      const [
        totalPlanetaryPositions,
        totalElementInteractions,
        totalModalityInteractions,
        totalPlanetInteractions
      ] = await Promise.all([
        this.planetaryPositionsService.getTotal(),
        this.elementInteractionsService.getTotal(),
        this.modalityInteractionsService.getTotal(),
        this.planetInteractionsService.getTotal()
      ]);

      // Get planetary positions by element
      const elementPipeline: any[] = [
        {
          $group: {
            _id: '$element',
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$count' },
            elements: {
              $push: {
                element: '$_id',
                count: '$count'
              }
            }
          }
        }
      ];

      // Get planetary positions by modality
      const modalityPipeline: any[] = [
        {
          $group: {
            _id: '$modality',
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$count' },
            modalities: {
              $push: {
                modality: '$_id',
                count: '$count'
              }
            }
          }
        }
      ];

      const [elementResult, modalityResult] = await Promise.all([
        this.planetaryPositionModel.aggregate(elementPipeline),
        this.planetaryPositionModel.aggregate(modalityPipeline)
      ]);

      // Process element distribution
      const planetaryPositionsByElement = elementResult[0] ? 
        elementResult[0].elements.map((el: { element: string; count: number }) => ({
          element: el.element,
          count: el.count,
          percentage: Math.round((el.count / elementResult[0].total) * 100)
        })).sort((a: any, b: any) => b.count - a.count) : [];

      // Process modality distribution
      const planetaryPositionsByModality = modalityResult[0] ? 
        modalityResult[0].modalities.map((mod: { modality: string; count: number }) => ({
          modality: mod.modality,
          count: mod.count,
          percentage: Math.round((mod.count / modalityResult[0].total) * 100)
        })).sort((a: any, b: any) => b.count - a.count) : [];

      logger.info('Astrology summary stats generated', {
        totalPlanetaryPositions,
        totalElementInteractions,
        totalModalityInteractions,
        totalPlanetInteractions
      }, 'AdminAstrologyStatsService');

      return {
        totalPlanetaryPositions,
        totalElementInteractions,
        totalModalityInteractions,
        totalPlanetInteractions,
        planetaryPositionsByElement,
        planetaryPositionsByModality
      };

    } catch (error) {
      logger.error('Failed to generate astrology summary stats', {
        error,
        query
      }, 'AdminAstrologyStatsService');
      throw error;
    }
  }

  async getInteractionStats(query?: AdminStatsQuery): Promise<AstrologyInteractionStats> {
    logger.info('Generating astrology interaction stats', { query }, 'AdminAstrologyStatsService');
    
    try {
      // Get dynamics distribution for each interaction type
      const getDynamicsDistribution = async (model: Model<any>) => {
        const pipeline: any[] = [
          {
            $group: {
              _id: '$dynamic',
              count: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$count' },
              dynamics: {
                $push: {
                  dynamic: '$_id',
                  count: '$count'
                }
              }
            }
          }
        ];

        const [result] = await model.aggregate(pipeline);
        return result ? result.dynamics.map((dyn: { dynamic: string; count: number }) => ({
          dynamic: dyn.dynamic,
          count: dyn.count,
          percentage: Math.round((dyn.count / result.total) * 100)
        })).sort((a: any, b: any) => b.count - a.count) : [];
      };

      const [elementDynamics, modalityDynamics, planetDynamics] = await Promise.all([
        getDynamicsDistribution(this.elementInteractionModel),
        getDynamicsDistribution(this.modalityInteractionModel),
        getDynamicsDistribution(this.planetInteractionModel)
      ]);

      // Find most common dynamic across all interactions
      const allDynamics = [...elementDynamics, ...modalityDynamics, ...planetDynamics];
      const dynamicCounts = allDynamics.reduce((acc, item) => {
        acc[item.dynamic] = (acc[item.dynamic] || 0) + item.count;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonDynamic = Object.entries(dynamicCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'harmony';

      return {
        elementDynamics,
        modalityDynamics,
        planetDynamics,
        mostCommonDynamic
      };

    } catch (error) {
      logger.error('Failed to generate astrology interaction stats', {
        error,
        query
      }, 'AdminAstrologyStatsService');
      throw error;
    }
  }

  async getKnowledgeDistributionStats(query?: AdminStatsQuery): Promise<AstrologyKnowledgeDistributionStats> {
    logger.info('Generating astrology knowledge distribution stats', { query }, 'AdminAstrologyStatsService');
    
    try {
      // Get planet distribution (positions + interactions)
      const planetPositionsPipeline: any[] = [
        {
          $group: {
            _id: '$planet',
            positionsCount: { $sum: 1 }
          }
        }
      ];

      const planetInteractionsPipeline: any[] = [
        {
          $facet: {
            planet1Counts: [
              { $group: { _id: '$planet1', count: { $sum: 1 } } }
            ],
            planet2Counts: [
              { $group: { _id: '$planet2', count: { $sum: 1 } } }
            ]
          }
        }
      ];

      const [planetPositionsResult, planetInteractionsResult] = await Promise.all([
        this.planetaryPositionModel.aggregate(planetPositionsPipeline),
        this.planetInteractionModel.aggregate(planetInteractionsPipeline)
      ]);

      // Combine planet interaction counts
      const planetInteractionCounts: Record<string, number> = {};
      if (planetInteractionsResult[0]) {
        [...planetInteractionsResult[0].planet1Counts, ...planetInteractionsResult[0].planet2Counts]
          .forEach((item: { _id: string; count: number }) => {
            planetInteractionCounts[item._id] = (planetInteractionCounts[item._id] || 0) + item.count;
          });
      }

      // Create planet distribution
      const planetDistribution = planetPositionsResult.map((pos: { _id: string; positionsCount: number }) => ({
        planet: pos._id,
        positionsCount: pos.positionsCount,
        interactionsCount: planetInteractionCounts[pos._id] || 0,
        totalReferences: pos.positionsCount + (planetInteractionCounts[pos._id] || 0)
      })).sort((a: any, b: any) => b.totalReferences - a.totalReferences);

      // Get sign distribution
      const signPipeline: any[] = [
        {
          $group: {
            _id: '$sign',
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$count' },
            signs: {
              $push: {
                sign: '$_id',
                count: '$count'
              }
            }
          }
        }
      ];

      const [signResult] = await this.planetaryPositionModel.aggregate(signPipeline);
      const signDistribution = signResult ? 
        signResult.signs.map((sign: { sign: string; count: number }) => ({
          sign: sign.sign,
          count: sign.count,
          percentage: Math.round((sign.count / signResult.total) * 100)
        })).sort((a: any, b: any) => b.count - a.count) : [];

      // Calculate keyword statistics
      const keywordsPipeline: any[] = [
        {
          $facet: {
            allEntries: [
              { $project: { keywordCount: { $size: '$keywords' } } },
              { $group: { _id: null, totalEntries: { $sum: 1 }, totalKeywords: { $sum: '$keywordCount' } } }
            ],
            uniqueKeywords: [
              { $unwind: '$keywords' },
              { $group: { _id: '$keywords' } },
              { $count: 'uniqueCount' }
            ]
          }
        }
      ];

      // Get keywords from all collections
      const [planetaryKeywords, elementKeywords, modalityKeywords, planetKeywords] = await Promise.all([
        this.planetaryPositionModel.aggregate(keywordsPipeline),
        this.elementInteractionModel.aggregate(keywordsPipeline),
        this.modalityInteractionModel.aggregate(keywordsPipeline),
        this.planetInteractionModel.aggregate(keywordsPipeline)
      ]);

      // Aggregate keyword stats
      let totalEntries = 0;
      let totalKeywords = 0;
      let totalUniqueKeywords = 0;

      [planetaryKeywords, elementKeywords, modalityKeywords, planetKeywords].forEach(result => {
        if (result[0]?.allEntries[0]) {
          totalEntries += result[0].allEntries[0].totalEntries;
          totalKeywords += result[0].allEntries[0].totalKeywords;
        }
        if (result[0]?.uniqueKeywords[0]) {
          totalUniqueKeywords += result[0].uniqueKeywords[0].uniqueCount;
        }
      });

      const averageKeywordsPerEntry = totalEntries > 0 ? 
        Math.round((totalKeywords / totalEntries) * 100) / 100 : 0;

      return {
        planetDistribution,
        signDistribution,
        averageKeywordsPerEntry,
        totalUniqueKeywords
      };

    } catch (error) {
      logger.error('Failed to generate astrology knowledge distribution stats', {
        error,
        query
      }, 'AdminAstrologyStatsService');
      throw error;
    }
  }
}