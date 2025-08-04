'use client'

declare global {
  interface Window {
    google: any;
  }
  let google: any;
}

import { useEffect, useRef, useState, useCallback } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

import { logger } from '@/util/logger';
import ComboInput from './ComboInput'

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

interface Suggestion {
  text: string
  placePrediction: any
}

interface PlacesSearchInputProps {
  id: string
  name: string
  label?: string
  value: PlaceResult | null
  onChange: (place: PlaceResult | null) => void
  placeholder?: string
  className?: string
}

export default function PlacesSearchInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = "Start typing...",
  className
}: PlacesSearchInputProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  
  const sessionToken = useRef<any>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  logger.info(value);

  // Initialize Google Maps
  useEffect(() => {
    const initPlaces = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: 'weekly',
      })

      try {
        const { AutocompleteSessionToken} = 
          await loader.importLibrary('places') as any
        
        sessionToken.current = new AutocompleteSessionToken()
        setIsLoaded(true)
      } catch (error) {
        console.error('Error loading Places library:', error)
      }
    }

    initPlaces()
  }, [])

  // Search function
  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (!sessionToken.current || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const request = {
        input: searchQuery,
        sessionToken: sessionToken.current,
        locationBias: {
          west: -180,
          north: 85,
          east: 180,
          south: -85,
        },
      }

      const { suggestions } = await (window as any).google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request)

      const cityResults = suggestions
        .filter((suggestion: any) => suggestion.placePrediction)
        .map((suggestion: any) => ({
          text: suggestion.placePrediction.text.text,
          placePrediction: suggestion.placePrediction
        }))

      setSuggestions(cityResults)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    }
  }, [])

  // Handle query change with debouncing
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      searchPlaces(value)
    }, 300)
  }, [searchPlaces])

  // Handle place selection
  const handlePlaceSelect = useCallback(async (suggestion: Suggestion | null) => {
    setSelectedSuggestion(suggestion)
    
    if (!suggestion) {
      onChange(null)
      setQuery('')
      return
    }

    try {
      const place = suggestion.placePrediction.toPlace()
      
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'id']
      })

      const placeResult: PlaceResult = {
        formatted_address: place.formattedAddress,
        geometry: {
          location: {
            lat: place.location.lat(),
            lng: place.location.lng(),
          }
        },
        place_id: place.id,
        name: place.displayName,
      }

      onChange(placeResult)
      setQuery(place.formattedAddress)
      setSuggestions([])

      // Create new session token
      sessionToken.current = new (window as any).google.maps.places.AutocompleteSessionToken()
    } catch (error) {
      console.error('Error getting place details:', error)
    }
  }, [onChange])

  const footer = (
    <div className="px-3 py-1 text-xs text-gray-400 bg-gray-50 border-t border-gray-100 text-right">
      Powered by Google
    </div>
  )

  return (
    <ComboInput<Suggestion>
      id={id}
      name={name}
      label={label}
      value={selectedSuggestion}
      onChange={handlePlaceSelect}
      displayValue={() => query}
      onInputChange={handleQueryChange}
      suggestions={suggestions}
      getSuggestionKey={(suggestion, index) => index}
      renderSuggestion={(suggestion) => suggestion.text}
      placeholder={placeholder}
      disabled={!isLoaded}
      className={className}
      footer={footer}
    />
  )
}