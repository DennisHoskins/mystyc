'use client'

import { ReactNode } from 'react';

export interface TabContent {
  id: string;
  content: ReactNode;
}

interface TabPanelProps {
  tabs: TabContent[];
  activeTab: string;
  className?: string;
}

export default function TabPanel({ 
  tabs, 
  activeTab,
  className = ''
}: TabPanelProps) {
  if (!tabs.length) return null;

  const activeTabContent = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={`w-full ${className} overflow-hidden flex flex-col grow min-h-0`}>
      <div className="grow min-h-0 flex flex-col overflow-hidden">
        {activeTabContent ? (
          <div key={activeTab} className="grow flex flex-col overflow-hidden">
            {activeTabContent.content}
          </div>
        ) : (
          <div className="grow">
          </div>
        )}
      </div>
    </div>
  );
}