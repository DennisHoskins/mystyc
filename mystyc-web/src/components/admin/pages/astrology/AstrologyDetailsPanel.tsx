'use client'

import { useEffect, useMemo, useState } from 'react';

import { AstrologySummary } from 'mystyc-common/admin';
import { getAstrologySummary } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminDetailGrid from '../../ui/detail/AdminDetailGrid';
import AdminDetailField from '../../ui/detail/AdminDetailField';

export default function AstrologyTabPanel() {
  const [summary, setSummary] = useState<AstrologySummary | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const summaryData = await getAstrologySummary({deviceInfo: getDeviceInfo()});
        setSummary(summaryData);
      } catch (err) {
        logger.error('Failed to load astrology summary:', err);
      }
    };

    loadSummary();
  }, []);

  return (
    <>
      <AdminDetailGrid cols={5}>
        <AdminDetailField 
         label='Signs'
         value={summary?.signs}
         href='/admin/astrology/signs'
        />
        <AdminDetailField 
         label='Elements'
         value={summary?.elements}
         href='/admin/astrology/elements'
        />
        <AdminDetailField 
         label='Planets'
         value={summary?.planets}
         href='/admin/astrology/planets'
        />
        <AdminDetailField 
         label='Modalities'
         value={summary?.modalities}
         href='/admin/astrology/modalities'
        />
        <AdminDetailField 
         label='Dynamics'
         value={summary?.dynamics}
         href='/admin/astrology/dynamics'
        />
        <AdminDetailField 
         label='Energy Types'
         value={summary?.energyTypes}
         href='/admin/astrology/energy-types'
        />
        <AdminDetailField 
         label='Planetary Positions'
         value={summary?.planetaryPositions}
         href='/admin/astrology/planetary-positions'
        />
        <AdminDetailField 
         label='Planet Interactions'
         value={summary?.planetInteractions}
         href='/admin/astrology/planet-interactions'
        />
        <AdminDetailField 
         label='Element Interactions'
         value={summary?.elementInteractions}
         href='/admin/astrology/element-interactions'
        />
        <AdminDetailField 
         label='Modality Interactions'
         value={summary?.modalityInteractions}
         href='/admin/astrology/modality-interactions'
        />
      </AdminDetailGrid>
   </>
  );
}