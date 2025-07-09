'use client';

import { Hash } from 'lucide-react'

export default function DashboardIcon({ size = 6 }: { size?: number }) {
  return (
    <Hash className={`w-${size} h-${size} text-gray-500`} />
  );    
}