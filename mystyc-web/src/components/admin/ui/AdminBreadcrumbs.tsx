'use client'

import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';

interface AdminBreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
}

export default function AdminBreadcrumbs({ breadcrumbs }: AdminBreadcrumbsProps) {
  return (
    <div className='w-fit overflow-hidden'>
      <Breadcrumbs level={3} items={breadcrumbs} />
    </div>
  );
}