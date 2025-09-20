import { z } from 'zod';

export const PlaceResultSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  formatted_address: z.string(),
  geometry: z.object({
    location: z.object({
      lat: z.number(),
      lng: z.number()
    })
  })
});

export type PlaceResult = z.infer<typeof PlaceResultSchema>;