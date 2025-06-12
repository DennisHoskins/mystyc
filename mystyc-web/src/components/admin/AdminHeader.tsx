'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function AdminHeader({ title, subtitle, icon }: AdminHeaderProps) {
  return (
    <div className="space-y-1 mb-6 flex items-center space-x-4">
      {icon && <span className="text-2xl">{icon}</span>}
      <div className="space-y-1">
        <Heading level={1}>{title}</Heading>
        {subtitle && <Text variant="muted">{subtitle}</Text>}
      </div>
    </div>
  );
}
