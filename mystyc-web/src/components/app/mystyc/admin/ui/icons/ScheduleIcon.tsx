'use client';

import { Clock } from 'lucide-react'

export default function ScheduleIcon({ size = 6 }: { size?: number }) {
  return (
    <Clock className={`w-${size} h-${size} text-gray-500`} />
  );    
}