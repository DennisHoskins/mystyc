import { Injectable } from '@nestjs/common';

import { 
  UserAstrologyData, 
} from 'mystyc-common/schemas';
import { 
  PlanetType, 
  ZodiacSignType,
} from 'mystyc-common/schemas';

import { logger } from '@/common/util/logger';
import { UserProfilesService } from './user-profiles.service';
import { AstrologyDataService } from '@/astrology/services/astrology-data.service';

@Injectable()
export class UserAstrologyService {
  constructor(
    private readonly userProfilesService: UserProfilesService,
    private readonly astrologyDataService: AstrologyDataService,
  ) {}

  /**
   * Gets complete astrology data for a user - replaces 60+ individual API calls
   * @param firebaseUid - Firebase user unique identifier
   * @returns Promise<UserAstrologyData | null> - Complete astrology data or null if user has no astrology
   */
  async getUserAstrologyData(firebaseUid: string): Promise<UserAstrologyData | null> {
    logger.info('Getting user astrology data', { firebaseUid }, 'UserAstrologyService');

    try {
      // Get user profile with astrology data
      const userProfile = await this.userProfilesService.findByFirebaseUid(firebaseUid);
      
      if (!userProfile?.astrology) {
        logger.warn('User has no astrology data', { firebaseUid }, 'UserAstrologyService');
        return null;
      }

      // Check if we have complete pre-assembled data
      if (userProfile.astrology.planetaryData && userProfile.astrology.interactions) {
        logger.info('Returning pre-assembled astrology data', { 
          firebaseUid,
          createdAt: userProfile.astrology.createdAt,
          lastCalculatedAt: userProfile.astrology.lastCalculatedAt,
          planetsCount: Object.keys(userProfile.astrology.planetaryData).length,
          planetInteractionsCount: Object.keys(userProfile.astrology.interactions.planets).length,
          elementInteractionsCount: Object.keys(userProfile.astrology.interactions.elements).length,
          modalityInteractionsCount: Object.keys(userProfile.astrology.interactions.modalities).length
        }, 'UserAstrologyService');
        
        return {
          planetaryData: userProfile.astrology.planetaryData,
          interactions: userProfile.astrology.interactions
        };
      }

      // Fallback: If we only have basic signs, assemble the data (legacy support)
      logger.warn('Found legacy astrology data, assembling and upgrading', { firebaseUid }, 'UserAstrologyService');
      
      const { sunSign, moonSign, risingSign, venusSign, marsSign } = userProfile.astrology;
      const signs: Record<PlanetType, ZodiacSignType> = { 
        Sun: sunSign, 
        Moon: moonSign, 
        Rising: risingSign, 
        Venus: venusSign, 
        Mars: marsSign 
      };
      
      // Assemble complete astrology data using the service
      const astrologyData = await this.astrologyDataService.assembleAstrologyData(signs);

      // Update user profile with complete data to avoid re-assembly next time
      try {
        const now = new Date();
        const completeAstrologyData = {
          // Keep existing signs
          sunSign,
          moonSign, 
          risingSign,
          venusSign,
          marsSign,
          
          // Add complete assembled data
          planetaryData: astrologyData.planetaryData,
          interactions: astrologyData.interactions,
          
          // Update metadata
          createdAt: userProfile.astrology.createdAt, // Keep original creation date
          lastCalculatedAt: now // Update calculation timestamp
        };
        
        await this.userProfilesService.updateProfile(
          firebaseUid,
          userProfile.email,
          { astrology: completeAstrologyData }
        );
        
        logger.info('Legacy astrology data upgraded successfully', {
          firebaseUid,
          originalCreatedAt: userProfile.astrology.createdAt,
          upgradedAt: now
        }, 'UserAstrologyService');
        
      } catch (updateError) {
        logger.error('Failed to upgrade legacy astrology data (non-critical)', {
          firebaseUid,
          updateError
        }, 'UserAstrologyService');
        // Don't throw - we can still return the assembled data even if saving fails
      }

      logger.info('Legacy astrology data assembled successfully', { 
        firebaseUid,
        planetsCount: Object.keys(astrologyData.planetaryData).length,
        planetInteractionsCount: Object.keys(astrologyData.interactions.planets).length,
        elementInteractionsCount: Object.keys(astrologyData.interactions.elements).length,
        modalityInteractionsCount: Object.keys(astrologyData.interactions.modalities).length
      }, 'UserAstrologyService');

      return astrologyData;
      
    } catch (error) {
      logger.error('Failed to get user astrology data', {
        firebaseUid,
        error
      }, 'UserAstrologyService');
      
      throw error;
    }
  }
}