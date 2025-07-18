'use client';

import { ReactNode } from 'react';

interface AdminDetailGroupProps {
  children: ReactNode;
  className?: string | '';
}

export default function AdminDetailGroup({ children, className }: AdminDetailGroupProps) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}