import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  icon: LucideIcon;
  iconColor?: string;
  backgroundColor?: string;
  textColor?: string;
  shortText: string;
  shortMessage?: string;
  longText: string;
  shortSubtext: string;
  longSubtext: React.ReactNode;
  badge?: React.ReactNode;
}

export default function StatusCard({
  icon: Icon,
  iconColor = 'text-gray-500',
  backgroundColor = 'bg-gray-50',
  textColor = 'text-gray-700',
  shortText,
  shortMessage,
  shortSubtext,
  longText,
  longSubtext,
  badge
}: StatusCardProps) {
  return (
    <div className="@container grow flex flex-col">
      <div className={`inline-flex flex-1 items-center w-full p-4 rounded-lg ${backgroundColor}`}>
        
        {/* Stacked layout for very small containers (< 140px) */}
        <div className="@[140px]:hidden flex flex-col items-center justify-center text-center w-full">
          <Icon className={`w-6 h-6 mb-2 ${iconColor}`} />
          <div className='flex flex-col'>
            <div className={`overflow-hidden font-medium text-sm leading-relaxed ${textColor}`}>
              {shortText}
            </div>
            {shortMessage && (
              <div className={`overflow-hidden font-medium text-sm leading-relaxed ${textColor}`}>
                {shortMessage}
              </div>
            )}
            <div className="text-xs text-gray-600 leading-relaxed">
              {shortSubtext}
              {badge && <div className="mt-1">{badge}</div>}
            </div>
          </div>
        </div>

        {/* Horizontal layout for larger containers (>= 140px) */}
        <div className="hidden @[140px]:flex items-center justify-center md:justify-start w-full">
          <Icon className={`w-6 h-6 mr-4 ${iconColor}`} />
          <div>
            <div className={`overflow-hidden font-medium text-sm leading-relaxed ${textColor}`}>
              {/* Short text for medium containers */}
              <span className='@[200px]:hidden'>
                {shortText}
              </span>
              {/* Long text for large containers */}
              <span className='hidden @[200px]:inline'>
                {longText}
              </span>
            </div>

            <div className="text-xs text-gray-600 leading-relaxed">
              {shortMessage && (
                <div className={`@[200px]:hidden overflow-hidden font-medium text-sm leading-relaxed ${textColor}`}>
                  {shortMessage}
                </div>
              )}
              {/* Short subtext for medium containers */}
              <span className='@[200px]:hidden'>
                {shortSubtext}
                {badge && <div className="mt-1">{badge}</div>}
              </span>
              {/* Long subtext for large containers */}
              <span className='hidden @[200px]:inline'>
                {longSubtext}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}