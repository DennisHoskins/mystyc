'use client'

import { useState, useEffect, useCallback } from 'react';

import { PlanetaryPosition, ZodiacSignType } from 'mystyc-common/schemas';
import { getPlanetaryPositionsBySign } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';

import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import AstrologyIcon from '@/components/admin/ui/icons/AstrologyIcon';
import Heading from '@/components/ui/Heading';
import PlanetaryPositionsTable from './PlanetaryPositionsTable';

export default function PlanetaryPositionsCard({ sign } : { sign: ZodiacSignType }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlanetaryPosition[]>([]);

  const loadPlanetaryPositions = useCallback(async (sign: ZodiacSignType) => {
    try {
      setError(null);
      setBusy(1000);
      const positions = await getPlanetaryPositionsBySign({deviceInfo: getDeviceInfo(), sign});
      setData(positions);
    } catch (err) {
      logger.error('Failed to load planetary positions:', err);
      setError('Failed to load planetary positions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadPlanetaryPositions(sign);
  }, [loadPlanetaryPositions, sign]);

  return (
    <Card className='space-y-4 grow'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={AstrologyIcon} />
        <div>
          <Heading level={5}>Planetary Positions</Heading>
        </div>
      </div>
      <hr/ >
      <PlanetaryPositionsTable 
        planetaryPositions={data}
        loadPlanetaryPositions={() => loadPlanetaryPositions(sign)}
      />
    </Card>
  );
}