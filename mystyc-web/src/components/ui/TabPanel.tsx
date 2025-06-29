'use client';

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
    <div className={`w-full ${className}`}>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200
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

            {tab.count !== undefined && (
              <span className={`
                ml-2 px-2 py-1 text-xs rounded-full
                ${activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-400'
                }
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="overflow-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${activeTab === tab.id ? 'block' : 'hidden'}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}