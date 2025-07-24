'use client';

import { ReactNode } from 'react';

interface AdminDetailGroupProps {
  children: ReactNode;
  className?: string | '';
}

export default function AdminDetailGroup({ children, className }: AdminDetailGroupProps) {
  return (
    <div className={`flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {children}
    </div>
  );
}