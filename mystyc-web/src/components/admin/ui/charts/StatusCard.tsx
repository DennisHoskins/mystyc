'use client'

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  icon: LucideIcon;
  iconColor?: string;
  backgroundColor?: string;
  textColor?: string;
  text: string;
  subtext?: string;
  badge?: React.ReactNode;
  vertical?: boolean;
}

export default function StatusCard({
  icon: Icon,
  iconColor = 'text-gray-500',
  backgroundColor = 'bg-[#230537]',
  textColor = 'text-gray-700',
  text,
  subtext,
  badge,
  vertical = false
}: StatusCardProps) {
  const className = vertical ? "flex-col" : "flex-row";

  return (
    <div className={`flex flex-1 ${className} grow items-center justify-center space-x-2 w-full p-2 rounded-lg ${backgroundColor}`}>
      <Icon className={`block w-6 h-6 ${iconColor}`} />
      <div className={`font-bold text-xs leading-relaxed ${textColor} flex items-center ${vertical ? 'pt-2' : ''}`}>
        {text}
        {badge}
      </div>
      <div className="text-[10px] text-gray-600 items-center leading-relaxed">
        {subtext}
      </div>
    </div>
  );
}