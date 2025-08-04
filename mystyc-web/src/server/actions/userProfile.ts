'use server'

import { headers } from 'next/headers';

import { User, UserProfileInput } from 'mystyc-common/schemas/';
import { DeviceInfo, Session, PlaceResult } from '@/interfaces/';
import { sessionManager } from '@/server/services/sessionManager';
import { authTokenManager } from '@/server/services/authTokenManager';
import { getTimezoneOffset } from '@/server/util/timezone';
import { logger } from '@/util/logger';

async function withSession<T>(
  action: (session: Session) => Promise<T>,
  deviceInfo: DeviceInfo,
  actionName: string
): Promise<T | null> {
  const headersList = await headers();
  
  try {
    const session = await sessionManager.getCurrentSession(headersList, deviceInfo);
    if (!session) {
      logger.log(`[${actionName}] No Current Session`);
      return null;
    }
    return action(session);
  } catch (err) {
    throw err;
  }
}


// Type for form data that might include PlaceResult
interface ProfileUpdateData extends Partial<UserProfileInput> {
  selectedPlace?: PlaceResult;
}

export async function updateUserProfile(
  deviceInfo: DeviceInfo,
  profileData: ProfileUpdateData
): Promise<User | null> {
  return withSession(async (session) => {
    logger.log('[updateUserProfile] Updating user profile', {
      updateFields: Object.keys(profileData)
    });

    if (!session.authToken) {
      throw new Error(`Failed to update profile: No Auth Token`);
    }

    // Clone the data to avoid mutating the original
    const transformedData = { ...profileData };

    // Transform PlaceResult to birthLocation with geo-tz
    if (profileData.selectedPlace) {
      const { selectedPlace, ...rest } = profileData;

      logger.info(rest);
      
      try {
        const { lat, lng } = selectedPlace.geometry.location;
        
        const timestamp = Math.floor(Date.now() / 1000); // current time, for DST-aware response
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

        // Create birthLocation object
        transformedData.birthLocation = {
          placeId: selectedPlace.place_id,
          name: selectedPlace.name,
          formattedAddress: selectedPlace.formatted_address,
          coordinates: {
            lat,
            lng
          },
          timezone: {
            name: timezoneString,
            offsetHours
          }
        };
        
        logger.log('[updateUserProfile] Transformed place to birthLocation', {
          placeName: selectedPlace.name,
          coordinates: { lat, lng },
          timezone: timezoneString,
          offsetHours
        });
        
        // Remove the selectedPlace from the data being sent
        delete transformedData.selectedPlace;
      } catch (error) {
        logger.error('[updateUserProfile] Failed to transform place data', { error });
        throw new Error('Failed to process birth location data');
      }
    }

    // Handle time defaults
    if ('timeOfBirth' in transformedData) {
      if (transformedData.timeOfBirth === "" || !transformedData.timeOfBirth) {
        // Empty time defaults to noon with hasTimeOfBirth = false
        transformedData.timeOfBirth = "12:00";
        transformedData.hasTimeOfBirth = false;
        logger.log('[updateUserProfile] Defaulted empty time to 12:00');
      } else {
        // User provided time, mark as accurate
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

      // The NestJS endpoint returns a UserProfile, but we need to return a full User object
      // So we need to fetch the complete user data
      const getUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': authTokenManager.createAuthHeader(session.authToken),
        },
      });

      if (!getUserResponse.ok) {
        logger.error('[updateUserProfile] Failed to fetch updated user data:', getUserResponse.status);
        throw new Error(`Failed to fetch updated user data: ${getUserResponse.status}`);
      }

      const updatedUser: User = await getUserResponse.json();
      
      if (!updatedUser || !updatedUser.firebaseUser || !updatedUser.userProfile) {
        logger.error('[updateUserProfile] Invalid user object returned from Nest');
        throw new Error('Invalid updated user data');
      }

      // Add device info to match the expected User structure
      updatedUser.device = {
        firebaseUid: updatedUser.firebaseUser.uid,
        deviceId: session.deviceId,
        deviceName: session.deviceName,
      };

      logger.log('[updateUserProfile] Profile updated successfully', {
        firebaseUid: updatedUser.firebaseUser.uid,
        updatedFields: Object.keys(profileData)
      });
      
      return updatedUser;
    } catch (error) {
      logger.error('[updateUserProfile] Failed to update profile', { error });
      throw error;
    }
  }, deviceInfo, 'updateUserProfile');
}