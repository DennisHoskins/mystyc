'use client'

import React from 'react';
import { ChartLine } from 'lucide-react';

export default function Rising({ className = 'w-10 h-10' }: { className?: string }) {
  return <ChartLine className={className} />
}
