'use client';

import { CalendarDays } from 'lucide-react'

export default function DashboardIcon({ size = 6 }: { size?: number }) {
  return (
    <CalendarDays className={`w-${size} h-${size} text-gray-500`} />
  );    
}