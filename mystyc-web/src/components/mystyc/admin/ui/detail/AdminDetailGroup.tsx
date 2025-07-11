'use client';

import { ReactNode } from 'react';

interface AdminDetailGroupProps {
  children: ReactNode;
}

export default function AdminDetailGroup({ children }: AdminDetailGroupProps) {
  return (
    <div className="space-y-4">
      {children}
    </div>
  );
}