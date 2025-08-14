'use client'

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  icon: LucideIcon;
  iconColor?: string;
  backgroundColor?: string;
  textColor?: string;
  shortText: string;
  longText: string;
  shortSubtext?: string;
  longSubtext?: React.ReactNode;
  badge?: React.ReactNode;
}

export default function StatusCard({
  icon: Icon,
  iconColor = 'text-gray-500',
  backgroundColor = 'bg-gray-50',
  textColor = 'text-gray-700',
  shortText,
  longText,
  shortSubtext,
  longSubtext,
  badge
}: StatusCardProps) {
  return (
    <div className="@container grow flex flex-col">
      <div className={`inline-flex flex-1 items-center w-full p-2 rounded-lg ${backgroundColor}`}>
        
        {/* Stacked layout for very small containers (< 190px) */}
        <div className="@[190px]:hidden flex flex-col items-center justify-center text-center w-full">
          <Icon className={`w-6 h-6 mb-2 ${iconColor}`} />
          <div>
            <div className={`overflow-hidden font-medium text-xs leading-relaxed ${textColor} flex items-end`}>
              {shortText}
              {badge}
            </div>
            <div className="text-[10px] text-gray-600 items-center leading-relaxed">
              {shortSubtext}
            </div>
          </div>
        </div>

        {/* Horizontal layout for larger containers (>= 190px) */}
        <div className="hidden @[190px]:flex items-center justify-center md:justify-start w-full">
          <Icon className={`w-6 h-6 mr-4 ${iconColor}`} />
          <div>
            <div className={`overflow-hidden font-medium text-sm leading-relaxed ${textColor}`}>
              {/* Short text for medium containers */}
              <span className='flex @[300px]:hidden'>
                {shortText}
                {badge}
              </span>
              {/* Long text for large containers */}
              <span className='hidden @[300px]:flex'>
                {longText}
                {badge}
              </span>
            </div>

            <div className="text-xs text-gray-600 leading-relaxed">
              {/* Short subtext for medium containers */}
              <span className='@[300px]:hidden'>
                {shortSubtext}
              </span>
              {/* Long subtext for large containers */}
              <span className='hidden @[300px]:flex'>
                {longSubtext}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}