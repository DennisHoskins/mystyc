'use server'

import { UserProfile, UserProfileInput } from 'mystyc-common/schemas/';
import { DeviceInfo } from '@/interfaces/';
import { PlaceResult } from '@/schemas/place-result.schema';
import { authTokenManager } from '@/server/services/authTokenManager';
import { logger } from '@/util/logger';
import { withSession } from '../util/withSession';

// Type for form data that might include PlaceResult
interface ProfileUpdateData extends Partial<UserProfileInput> {
  selectedPlace?: PlaceResult;
}

export async function updateUserProfile(
  deviceInfo: DeviceInfo,
  profileData: ProfileUpdateData
): Promise<UserProfile | null> {
  return withSession(async (session) => {
    logger.log('[updateUserProfile] Updating user profile', {
      updateFields: Object.keys(profileData)
    });

    if (!session.authToken) {
      throw new Error(`Failed to update profile: No Auth Token`);
    }

    // Clone the data to avoid mutating the original
    let transformedData = { ...profileData };

    // Transform PlaceResult to birthLocation with geo-tz
    if (profileData.selectedPlace) {
      const { selectedPlace, ...rest } = profileData;
      
      try {
        const { lat, lng } = selectedPlace.geometry.location;
        
        const timestamp = Math.floor(Date.now() / 1000);
        const timezoneRes = await fetch(
          `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );

        if (!timezoneRes.ok) {
          const errorText = await timezoneRes.text();
          logger.error('[updateUserProfile] Google Time Zone API HTTP error', { errorText });
          throw new Error('Failed to reach Google Time Zone API');
        }

        const timezoneData = await timezoneRes.json();

        if (timezoneData.status !== 'OK') {
          logger.error('[updateUserProfile] Google Time Zone API returned error', { timezoneData });
          throw new Error(`Timezone lookup failed: ${timezoneData.status}`);
        }

        const timezoneString = timezoneData.timeZoneId;
        const offsetHours = (timezoneData.rawOffset + timezoneData.dstOffset) / 3600;

        transformedData = {
          ...rest,
          birthLocation: {
            placeId: selectedPlace.place_id,
            name: selectedPlace.name,
            formattedAddress: selectedPlace.formatted_address,
            coordinates: { lat, lng },
            timezone: { name: timezoneString, offsetHours }
          }
        };
        
        logger.log('[updateUserProfile] Transformed place to birthLocation', {
          placeName: selectedPlace.name,
          coordinates: { lat, lng },
          timezone: timezoneString,
          offsetHours
        });
        
        delete transformedData.selectedPlace;
      } catch (error) {
        logger.error('[updateUserProfile] Failed to transform place data', { error });
        throw new Error('Failed to process birth location data');
      }
    }

    // Handle time defaults
    if ('timeOfBirth' in transformedData) {
      if (transformedData.timeOfBirth === "" || !transformedData.timeOfBirth) {
        transformedData.timeOfBirth = "12:00";
        transformedData.hasTimeOfBirth = false;
        logger.log('[updateUserProfile] Defaulted empty time to 12:00');
      } else {
        transformedData.hasTimeOfBirth = true;
        logger.log('[updateUserProfile] User provided birth time', {
          timeOfBirth: transformedData.timeOfBirth
        });
      }
    }

    try {
      const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/update-profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': authTokenManager.createAuthHeader(session.authToken),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData)
      });

      if (!nestResponse.ok) {
        logger.error('[updateUserProfile] Failed to update profile in Nest:', nestResponse.status);
        const errorText = await nestResponse.text();
        logger.error('[updateUserProfile] Error response:', errorText);
        throw new Error(`Failed to update profile: ${nestResponse.status}`);
      }

      // Get the updated UserProfile from the response
      const updatedUserProfile = await nestResponse.json();

      logger.log('[updateUserProfile] Profile updated successfully', {
        updatedFields: Object.keys(profileData)
      });
      
      return updatedUserProfile;
    } catch (error) {
      logger.error('[updateUserProfile] Failed to update profile', { error });
      throw error;
    }
  }, deviceInfo, 'updateUserProfile');
}