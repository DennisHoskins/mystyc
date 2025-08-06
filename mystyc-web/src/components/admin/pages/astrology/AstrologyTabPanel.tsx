'use client'

import { useEffect, useMemo, useState } from 'react';

import { AstrologySummary } from 'mystyc-common/admin';
import { getAstrolgySummary } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import TabPanel, { Tab } from '@/components/ui/TabPanel';
import AstrologyPlanetaryPositionsTable from './tables/AstrologyPlanetaryPositionsTable';
import AstrologyElementInteractionsTable from './tables/AstrologyElementInteractionsTable';
import AstrologyModalityInteractionsTable from './tables/AstrologyModalityInteractionsTable';
import AstrologyPlanetInteractionsTable from './tables/AstrologyPlanetInteractionsTable';

export default function AstrologyTabPanel() {
  const [activeTab, setActiveTab] = useState('planetary-positions');
  const [summary, setSummary] = useState<AstrologySummary | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const summaryData = await getAstrolgySummary({deviceInfo: getDeviceInfo()});
        setSummary(summaryData);
      } catch (err) {
        logger.error('Failed to load astrology summary:', err);
      }
    };

    loadSummary();
  }, []);

  const tabs: Tab[] = useMemo(() => {
    return [
      {
        id: 'planetary-positions',
        label: 'Planetary Positions',
        count: summary?.planetaryPositions,
        content: (
          <AstrologyPlanetaryPositionsTable
            isActive={activeTab === 'planetary-positions'}
          />
        )
      },
      {
        id: 'element-interactions',
        label: 'Element Interactions',
        count: summary?.elementInteractions,
        content: (
          <AstrologyElementInteractionsTable
            isActive={activeTab === 'element-interactions'}
          />
        )
      },
      {
        id: 'modality-interactions',
        label: 'Modality Interactions',
        count: summary?.modalityInteractions,
        content: (
          <AstrologyModalityInteractionsTable
            isActive={activeTab === 'modality-interactions'}
          />
        )
      },
      {
        id: 'planet-interactions',
        label: 'Planet Interactions',
        count: summary?.planetInteractions,
        content: (
          <AstrologyPlanetInteractionsTable
            isActive={activeTab === 'planet-interactions'}
          />
        )
      },
    ];
  }, [activeTab, summary]);

  return (
    <TabPanel 
      tabs={tabs} 
      defaultActiveTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}