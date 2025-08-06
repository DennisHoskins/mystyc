'use client'

import { useMemo, useState } from 'react';

import TabPanel, { Tab } from '@/components/ui/TabPanel';
import AstrologyPlanetaryPositionsTable from './tables/AstrologyPlanetaryPositionsTable';
import AstrologyElementInteractionsTable from './tables/AstrologyElementInteractionsTable';
import AstrologyModalityInteractionsTable from './tables/AstrologyModalityInteractionsTable';
import AstrologyPlanetInteractionsTable from './tables/AstrologyPlanetInteractionsTable';

export default function AstrologyTabPanel() {
  const [activeTab, setActiveTab] = useState('planetary-positions');

  const tabs: Tab[] = useMemo(() => {
    return [
      {
        id: 'planetary-positions',
        label: 'Planetary Positions',
        content: (
          <AstrologyPlanetaryPositionsTable
            isActive={activeTab === 'planetary-positions'}
          />
        )
      },
      {
        id: 'element-interactions',
        label: 'Element Interactions',
        content: (
          <AstrologyElementInteractionsTable
            isActive={activeTab === 'element-interactions'}
          />
        )
      },
      {
        id: 'modality-interactions',
        label: 'Modality Interactions',
        content: (
          <AstrologyModalityInteractionsTable
            isActive={activeTab === 'modality-interactions'}
          />
        )
      },
      {
        id: 'planet-interactions',
        label: 'Planet Interactions',
        content: (
          <AstrologyPlanetInteractionsTable
            isActive={activeTab === 'planet-interactions'}
          />
        )
      },
    ];
  }, [activeTab]);

  return (
    <TabPanel 
      tabs={tabs} 
      defaultActiveTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}