'use client';

import { ReactNode } from 'react';
import Card from '@/components/ui/Card';

interface AdminDetailGridProps {
  children: ReactNode;
}

export default function AdminDetailGrid({ children }: AdminDetailGridProps) {
  return (
    <Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </Card>
  );
}