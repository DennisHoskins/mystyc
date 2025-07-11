'use client';

import { Sparkle } from 'lucide-react'

export default function DashboardIcon({ size = 6 }: { size?: number }) {
  return (
    <Sparkle className={`w-${size} h-${size} text-gray-500`} />
  );    
}