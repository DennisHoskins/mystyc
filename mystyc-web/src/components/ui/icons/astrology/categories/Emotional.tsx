'use client'

import React from 'react';
import { HeartPulse } from 'lucide-react';

export default function Emotional({ className = 'w-10 h-10' }: { className?: string }) {
  return <HeartPulse className={className} />
}
