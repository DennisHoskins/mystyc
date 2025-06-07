import React from 'react';

import Panel from '@/components/ui/Panel';
import Heading from '@/components/ui/Heading';

interface AdminPanelProps {
  children: React.ReactNode;
  title: string;
  variant?: 'default' | 'primary' | 'success' | 'info' | 'warning' | 'danger';
  className?: string;
}

export default function AdminPanel({ 
  children, 
  title, 
  variant = 'default', 
  className 
}: AdminPanelProps) {
  // Map variants to heading text colors
  const headingColors = {
    default: 'text-gray-900',
    primary: 'text-blue-900',
    success: 'text-green-900',
    info: 'text-purple-900',
    warning: 'text-yellow-900',
    danger: 'text-red-900',
  };

  return (
    <Panel variant={variant} className={className}>
      <Heading level={3} className={`${headingColors[variant]} mb-4`}>
        {title}
      </Heading>
      {children}
    </Panel>
  );
}