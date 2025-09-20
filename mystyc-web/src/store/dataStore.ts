import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Horoscope, AstrologyComplete, DailyEnergyRangeResponse } from 'mystyc-common';
import { logger } from '@/util/logger';

interface CachedInsight {
  date: string; // ISO date format "2025-01-15"
  data: Horoscope;
  cachedAt: number; // timestamp
}

interface CachedWeeklyEnergy {
  startDate: string; // ISO date format "2025-01-15" (the start date of the week)
  data: DailyEnergyRangeResponse;
  cachedAt: number; // timestamp
}

export interface DataState {
  // State
  insights: Record<string, CachedInsight>; // keyed by date string
  weeklyEnergy: Record<string, CachedWeeklyEnergy>; // keyed by start date string
  astrology: AstrologyComplete | null;
  
  // Actions
  getCachedInsights: (date: Date, timezone: string) => Horoscope | null;
  cacheInsights: (date: Date, timezone: string, data: Horoscope) => void;
  getCachedWeeklyEnergy: (startDate: Date, timezone: string) => DailyEnergyRangeResponse | null;
  cacheWeeklyEnergy: (startDate: Date, timezone: string, data: DailyEnergyRangeResponse) => void;
  getCachedAstrology: () => AstrologyComplete | null;
  cacheAstrology: (data: AstrologyComplete) => void;
  clearDataCache: () => void;
}

const getTodayDateString = (timezone: string): string => {
  try {
    const now = new Date();
    const todayInTimezone = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    return todayInTimezone.toISOString().split('T')[0];
  } catch (error) {
    logger.error('[dataStore] Failed to get today date string for timezone:', timezone, error);
    // Fallback to UTC
    return new Date().toISOString().split('T')[0];
  }
};

const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      // Initial state
      insights: {},
      weeklyEnergy: {},
      astrology: null,

      // Get cached insights for today, clear old ones
      getCachedInsights: (date: Date, timezone: string) => {
        const state = get();
        const requestDateString = getDateString(date);
        const todayDateString = getTodayDateString(timezone);
        
        logger.log('[dataStore] Checking cached insights for date:', requestDateString, 'today:', todayDateString);

        // Clean up old insights (keep only today's)
        const cleanedInsights: Record<string, CachedInsight> = {};
        Object.entries(state.insights).forEach(([dateKey, cached]) => {
          if (dateKey === todayDateString) {
            cleanedInsights[dateKey] = cached;
            logger.log('[dataStore] Keeping cached insight for:', dateKey);
          } else {
            logger.log('[dataStore] Removing old cached insight for:', dateKey);
          }
        });

        // Update state with cleaned insights if we removed any
        if (Object.keys(cleanedInsights).length !== Object.keys(state.insights).length) {
          set({ insights: cleanedInsights });
        }

        // Return cached data if it exists for the requested date
        const cached = cleanedInsights[requestDateString];
        if (cached) {
          logger.log('[dataStore] Found cached insights for:', requestDateString);
          return cached.data;
        }

        logger.log('[dataStore] No cached insights found for:', requestDateString);
        return null;
      },

      // Cache insights for a specific date
      cacheInsights: (date: Date, timezone: string, data: Horoscope) => {
        const dateString = getDateString(date);
        logger.log('[dataStore] Caching insights for date:', dateString);
        
        set(state => ({
          insights: {
            ...state.insights,
            [dateString]: {
              date: dateString,
              data,
              cachedAt: Date.now()
            }
          }
        }));
      },

      // Get cached weekly energy, clean old ones
      getCachedWeeklyEnergy: (startDate: Date, timezone: string) => {
        const state = get();
        const requestStartDateString = getDateString(startDate);
        const todayDateString = getTodayDateString(timezone);
        
        logger.log('[dataStore] Checking cached weekly energy for start date:', requestStartDateString, 'today:', todayDateString);

        // Clean up old weekly energy (keep only current week's)
        const cleanedWeeklyEnergy: Record<string, CachedWeeklyEnergy> = {};
        Object.entries(state.weeklyEnergy).forEach(([startDateKey, cached]) => {
          if (startDateKey === requestStartDateString) {
            cleanedWeeklyEnergy[startDateKey] = cached;
            logger.log('[dataStore] Keeping cached weekly energy for start date:', startDateKey);
          } else {
            logger.log('[dataStore] Removing old cached weekly energy for start date:', startDateKey);
          }
        });

        // Update state with cleaned weekly energy if we removed any
        if (Object.keys(cleanedWeeklyEnergy).length !== Object.keys(state.weeklyEnergy).length) {
          set({ weeklyEnergy: cleanedWeeklyEnergy });
        }

        // Return cached data if it exists for the requested start date
        const cached = cleanedWeeklyEnergy[requestStartDateString];
        if (cached) {
          logger.log('[dataStore] Found cached weekly energy for start date:', requestStartDateString);
          return cached.data;
        }

        logger.log('[dataStore] No cached weekly energy found for start date:', requestStartDateString);
        return null;
      },

      // Cache weekly energy for a specific start date
      cacheWeeklyEnergy: (startDate: Date, timezone: string, data: DailyEnergyRangeResponse) => {
        const startDateString = getDateString(startDate);
        logger.log('[dataStore] Caching weekly energy for start date:', startDateString);
        
        set(state => ({
          weeklyEnergy: {
            ...state.weeklyEnergy,
            [startDateString]: {
              startDate: startDateString,
              data,
              cachedAt: Date.now()
            }
          }
        }));
      },

      // Get cached astrology data
      getCachedAstrology: () => {
        const state = get();
        if (state.astrology) {
          logger.log('[dataStore] Found cached astrology data');
          return state.astrology;
        }
        logger.log('[dataStore] No cached astrology data found');
        return null;
      },

      // Cache astrology data
      cacheAstrology: (data: AstrologyComplete) => {
        logger.log('[dataStore] Caching astrology data');
        set({ astrology: data });
      },

      // Clear all cached data
      clearDataCache: () => {
        logger.log('[dataStore] Clearing all cached data');
        set({
          insights: {},
          weeklyEnergy: {},
          astrology: null
        });
      }
    }),
    {
      name: 'data-storage',
      partialize: (state) => ({
        insights: state.insights,
        weeklyEnergy: state.weeklyEnergy,
        astrology: state.astrology
      })
    }
  )
);