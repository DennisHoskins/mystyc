'use client'

import { useState } from 'react';

import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import AstrologyIcon from '@/components/admin/ui/icons/AstrologyIcon';
import AstrologyTabPanel from './AstrologyTabPanel';

export default function AstrologyPage() {
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology' },
  ];

  const retryAll = () => {
    setError(null);
  };

  return (
   <AdminListLayout
      error={error}
      onRetry={retryAll}
      breadcrumbs={breadcrumbs}
      icon={AstrologyIcon}
      description="View astrology knowledge base including planetary positions and interactions between elements, modalities, and planets"
      headerContent={<AstrologyTabPanel key='astrology-tabs' />}
    />   
  );
}