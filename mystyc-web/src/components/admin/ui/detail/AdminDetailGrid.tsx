'use client'

import { ReactNode } from 'react';

interface AdminDetailGridProps {
  children: ReactNode;
  className?: string | '';
  cols?: number;
}

const gridClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
};

export default function AdminDetailGrid({ children, className, cols = 4 }: AdminDetailGridProps) {
  return (
    <div className={`flex-1 grid ${gridClasses[cols] || gridClasses[4]} gap-4 ${className}`}>
      {children}
    </div>
  );
}