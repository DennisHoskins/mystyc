'use client'

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight } from 'lucide-react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { DeviceInfo } from '@/interfaces/';
import { PlaceResultSchema } from '@/schemas/place-result.schema';
import { updateUserProfile } from '@/server/actions/userProfile';
import { useUserStore } from '@/store/userStore';

import FormLayout from '@/components/ui/form/FormLayout';
import Form from '@/components/ui/form/Form';
import PlacesSearchInput from '@/components/ui/form/PlacesSearchInput';
import Button from '@/components/ui/Button';

interface CityPanelProps {
  user: AppUser;
  deviceInfo: DeviceInfo;
  setIsWorking: (working: boolean) => void;
}

const CitySchema = z.object({
  selectedPlace: PlaceResultSchema.optional().refine(val => val !== undefined, "Please select your birth city")
});

type CityFormData = z.infer<typeof CitySchema>;

export default function CityPanel({ user, deviceInfo, setIsWorking }: CityPanelProps) {
  const { setUser } = useUserStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const { 
    control,
    handleSubmit, 
    formState: { errors, isValid }
  } = useForm<CityFormData>({
    resolver: zodResolver(CitySchema),
    mode: 'onChange',
    defaultValues: {
      selectedPlace: user.userProfile.birthLocation ? {
        place_id: user.userProfile.birthLocation.placeId,
        name: user.userProfile.birthLocation.name,
        formatted_address: user.userProfile.birthLocation.formattedAddress,
        geometry: {
          location: {
            lat: user.userProfile.birthLocation.coordinates.lat,
            lng: user.userProfile.birthLocation.coordinates.lng
          }
        }
      } : undefined
    }
  });

  const onSubmit = async (data: CityFormData) => {
    try {
      setIsWorking(true);
      const updatedUserProfile = await updateUserProfile(deviceInfo, {
        selectedPlace: data.selectedPlace
      });
      if (updatedUserProfile) {
        user.userProfile = updatedUserProfile;
        setUser(user);
        window.dispatchEvent(new CustomEvent('wizard-next'));
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Failed to update birth location');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <FormLayout
      subtitle={<>We use your birth city to fine-tune your chart.<br />No need for an exact address—just the city works.</>}
      error={serverError}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="selectedPlace"
          control={control}
          render={({ field }) => (
            <PlacesSearchInput
              id="birthCity"
              name="birthCity"
              label="Enter the city you were born in"
              value={field.value || null}
              onChange={(place) => field.onChange(place || undefined)}
              placeholder="Start typing city name..."
              error={errors.selectedPlace?.message}
            />
          )}
        />

        <Button
          type="submit"
          disabled={!isValid}
          className="py-3 w-auto min-w-28 self-end flex items-center justify-center"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2 -mr-1" strokeWidth={3} />
        </Button>
      </Form>
    </FormLayout>
  );
}