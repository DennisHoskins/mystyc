import { ReactNode } from 'react';

interface AdminDetailGridProps {
  children: ReactNode;
}

export default function AdminDetailGrid({ children }: AdminDetailGridProps) {
  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-1 grid-cols-1">
      {children}
    </div>
  );
}