'use client';

import { User } from 'lucide-react'

export default function UserIcon({ size = 6 }: { size?: number }) {
  return (
    <User className={`w-${size} h-${size} text-gray-500`} />
  );    
}