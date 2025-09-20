'use client'

export interface Tab {
  id: string;
  label: string;
  count?: number | string | null;
  hasCount?: boolean;
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
    <div className={`w-full ${className} min-h-7`}>
      <div className="flex">
        {tabs.map((tab) => (
          <div key={tab.id}>
            {((!tab.hasCount) || (tab.hasCount && tab.count != null)) &&
              <button
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex px-4 py-1 text-[10px] font-bold border-b-2 transition-colors duration-200 items-baseline justify-center
                  ${activeTab === tab.id 
                    ? 'border-purple-800' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className={`flex items-end min-h-4
                  ${activeTab === tab.id 
                    ? 'text-white' 
                    : 'text-gray-500'
                  }
                `}>
                  {tab.label}
                  {tab.hasCount &&
                    <span className={`ml-1 text-xs text-left block`}>
                      {tab.count}
                    </span>
                  }
                </span>
              </button>
            }
          </div>
        ))}
      </div>
    </div>
  );
}