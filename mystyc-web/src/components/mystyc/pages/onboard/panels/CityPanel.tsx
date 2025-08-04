'use client'

import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

import { AppUser } from '@/interfaces/app/app-user.interface'
import FormLayout from '@/components/ui/form/FormLayout'
import Form from '@/components/ui/form/Form'
import PlacesSearchInput from '@/components/ui/form/PlacesSearchInput'
import Button from '@/components/ui/Button'

interface PlaceResult {
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  place_id: string
  name: string
}

export default function CityPanel({ user, setIsWorking }: { user: AppUser, setIsWorking: (working: boolean) => void }) {
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)

  useEffect(() => {
    setIsWorking(false);
  }, [setIsWorking])

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = async () => {
      setIsWorking(true);
      await new Promise(resolve => setTimeout(resolve, 2500));
      window.dispatchEvent(new CustomEvent('wizard-next'));
    }
    next();
  };

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
      error={null}
    >
      <Form onSubmit={handleSubmit}>
        <PlacesSearchInput
          id="birthCity"
          name="birthCity"
          label="Enter the city you were born in"
          value={selectedPlace}
          onChange={setSelectedPlace}
          placeholder="Start typing city name..."
        />

        <Button
          type="submit"
          loadingContent="Working..."
          className="py-3 w-auto min-w-28 self-end flex items-center justify-center"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2 -mr-1 mt-[1.5px]" strokeWidth={3} />
        </Button>
      </Form>
    </FormLayout>
  )
}