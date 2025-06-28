'use client';

import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';

interface AdminHeaderProps {
  description: string;
  breadcrumbs: BreadcrumbItem[];
}

export default function AdminHeader({ description, breadcrumbs }: AdminHeaderProps) {
  return (
    <Card>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbs} />
        <Text>{description}</Text>
      </div>
    </Card>
  );
}