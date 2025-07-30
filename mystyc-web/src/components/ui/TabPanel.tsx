'use client'

import { useState, ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  count?: number;
  content: ReactNode;
}

interface TabPanelProps {
  tabs: Tab[];
  defaultActiveTab?: string;
  height?: string;
  className?: string;
  onTabChange?: (tabId: string) => void;
}

export default function TabPanel({ 
  tabs, 
  defaultActiveTab, 
  className = '',
  onTabChange 
}: TabPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id || '');

  if (!tabs.length) return null;

   const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className={`w-full ${className} overflow-hidden flex flex-col grow min-h-0`}>
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              flex grow px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 items-center justify-center
              ${activeTab === tab.id 
                ? 'border-blue-500' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <span className={`
              ${activeTab === tab.id 
                ? 'text-gray-600' 
                : 'text-gray-400'
              }
            `}>
              {tab.label}
            </span>

              
            <span className={`
              flex ml-2 w-5 h-5 items-center justify-center text-xs rounded-full
              ${activeTab === tab.id 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-400'
              }
            `}>
              {tab.count || '0'}
            </span>
            
          </button>
        ))}
      </div>

      <div className="grow min-h-0 flex flex-col overflow-hidden">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${activeTab === tab.id ? 'flex flex-col overflow-hidden' : 'hidden'}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}