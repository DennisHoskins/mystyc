'use client';

import Card from '@/components/ui/Card';
import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';

interface AdminBreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
}

export default function AdminBreadcrumbs({ breadcrumbs }: AdminBreadcrumbsProps) {
  return (
    <Card className='mb-4 w-fit'>
      <Breadcrumbs items={breadcrumbs} />
    </Card>
  );
}