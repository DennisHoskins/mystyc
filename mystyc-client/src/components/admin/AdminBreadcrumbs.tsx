import React from 'react';

import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';

interface AdminBreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function AdminBreadcrumbs({ items = [], className }: AdminBreadcrumbsProps) {
  const defaultItems: BreadcrumbItem[] = [
    { label: 'Admin', href: '/admin' }
  ];

  const breadcrumbItems = [...defaultItems, ...items];

  return <Breadcrumbs items={breadcrumbItems} className={className} />;
}