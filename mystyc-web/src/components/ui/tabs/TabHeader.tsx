'use client'

export interface Tab {
  id: string;
  label: string;
  count?: number | string | null;
}

interface TabHeaderProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function TabHeader({ 
  tabs, 
  activeTab,
  onTabChange,
  className = ''
}: TabHeaderProps) {
  if (!tabs.length) return null;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex px-4 py-1 text-[10px] font-bold border-b-2 transition-colors duration-200 items-center justify-center
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
              <span className={`ml-1 text-xs`}>
                {tab.count}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}