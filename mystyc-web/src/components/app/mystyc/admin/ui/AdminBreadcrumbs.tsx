'use client';

import Card from '@/components/ui/Card';
import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';

interface AdminBreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
}

export default function AdminBreadcrumbs({ breadcrumbs }: AdminBreadcrumbsProps) {
  return (
    <div className='w-fit overflow-hidden'>
      <Breadcrumbs level={2} items={breadcrumbs} />
    </div>
  );
}