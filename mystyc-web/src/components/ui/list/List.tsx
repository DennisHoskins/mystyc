import React from 'react';

interface ListProps {
  children: React.ReactNode;
  className?: string;
  columns?: number;
}

export default function List({ children, className = '', columns }: ListProps) {
  const layoutClasses = columns
    ? `grid grid-cols-${columns} gap-x-2 gap-y-2`
    : 'space-y-2';

  return <ul className={`${layoutClasses} ${className}`}>{children}</ul>;
}
