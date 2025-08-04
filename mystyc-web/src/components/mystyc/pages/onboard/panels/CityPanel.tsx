'use client'

import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

import { AppUser } from '@/interfaces/app/app-user.interface'
import { DeviceInfo, PlaceResult } from '@/interfaces/'
import { updateUserProfile } from '@/server/actions/userProfile'
import { useUserStore } from '@/store/userStore'

import FormLayout from '@/components/ui/form/FormLayout'
import Form from '@/components/ui/form/Form'
import PlacesSearchInput from '@/components/ui/form/PlacesSearchInput'
import Button from '@/components/ui/Button'

interface CityPanelProps {
  user: AppUser;
  setIsWorking: (working: boolean) => void;
  deviceInfo: DeviceInfo;
}

export default function CityPanel({ user, setIsWorking, deviceInfo }: CityPanelProps) {
  const { setUser } = useUserStore();
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ place?: string[] }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setIsWorking(false);
    // Pre-populate if user already has birth location
    if (user.userProfile.birthLocation) {
      // Create a mock PlaceResult from existing birth location data
      // This won't be perfect but will show the location name
      const mockPlaceResult: PlaceResult = {
        place_id: user.userProfile.birthLocation.placeId,
        name: user.userProfile.birthLocation.name,
        formatted_address: user.userProfile.birthLocation.formattedAddress,
        geometry: {
          location: {
            lat: user.userProfile.birthLocation.coordinates.lat,
            lng: user.userProfile.birthLocation.coordinates.lng
          }
        }
      };
      setSelectedPlace(mockPlaceResult);
    }
  }, [setIsWorking, user.userProfile.birthLocation]);

  if (!user) {
    return null;
  }

  const validatePlace = (place: PlaceResult | null) => {
    if (!place) {
      setFieldErrors({ place: ['Please select your birth city'] });
      return false;
    }

    // Basic validation - ensure required properties exist
    if (!place.place_id || !place.name || !place.formatted_address || 
        !place.geometry?.location?.lat || !place.geometry?.location?.lng) {
      setFieldErrors({ place: ['Invalid location selected'] });
      return false;
    }

    setFieldErrors({ place: undefined });
    return true;
  };

  const handlePlaceChange = (place: PlaceResult | null) => {
    setSelectedPlace(place);
    if (place) {
      validatePlace(place);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    
    // Validate place selection
    if (!validatePlace(selectedPlace)) {
      return;
    }

    try {
      setIsWorking(true);
      
      const profileUpdate = {
        selectedPlace: selectedPlace!,
      };
      
      const updatedUser = await updateUserProfile(deviceInfo, profileUpdate);
      
      if (updatedUser) {
        setUser(updatedUser);
        window.dispatchEvent(new CustomEvent('wizard-next'));
      } else {
        throw new Error('No user data returned from server');
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Failed to update birth location');
    } finally {
      setIsWorking(false);
    }
  };

  const hasFieldErrors = Object.values(fieldErrors).some(errors => errors && errors.length > 0);
  const isFormValid = selectedPlace && !hasFieldErrors;

  return (
    <FormLayout
      title="Where were you born?"
      subtitle={
        <>
          We use your birth city to fine-tune your chart.
          <br />
          No need for an exact address—just the city works.
        </>
      }
      error={serverError}
    >
      <Form onSubmit={handleSubmit}>
        <PlacesSearchInput
          id="birthCity"
          name="birthCity"
          label="Enter the city you were born in"
          value={selectedPlace}
          onChange={handlePlaceChange}
          placeholder="Start typing city name..."
          error={fieldErrors.place?.[0]}
        />

        <Button
          type="submit"
          disabled={!isFormValid}
          loadingContent="Working..."
          className="py-3 w-auto min-w-28 self-end flex items-center justify-center"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2 -mr-1" strokeWidth={3} />
        </Button>
      </Form>
    </FormLayout>
  )
}