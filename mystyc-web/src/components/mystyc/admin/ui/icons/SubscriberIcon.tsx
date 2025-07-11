'use client';

import { DollarSign } from 'lucide-react'

export default function DashboardIcon({ size = 6 }: { size?: number }) {
  return (
    <DollarSign className={`w-${size} h-${size} text-gray-500`} />
  );    
}