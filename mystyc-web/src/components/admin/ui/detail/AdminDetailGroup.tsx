'use client';

import { ReactNode } from 'react';

interface AdminDetailGroupProps {
  children: ReactNode;
  className?: string | '';
  cols?: number;
}

const gridClasses: Record<number, string> = {
  1: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
  6: 'grid-cols-1 md:grid-cols-3 xl:grid-cols-6',
};

export default function AdminDetailGroup({ children, className, cols = 4 }: AdminDetailGroupProps) {
  return (
    <div className={`flex-1 grid ${gridClasses[cols] || gridClasses[4]} gap-4 ${className}`}>
      {children}
    </div>
  );
}