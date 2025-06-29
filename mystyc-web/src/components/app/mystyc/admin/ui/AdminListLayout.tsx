'use client';

import { ReactNode } from 'react';
import Card from '@/components/ui/Card';
import { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

interface AdminListLayoutProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  tableContent?: ReactNode;
}

export default function AdminListLayout({ breadcrumbs, title, description, tableContent }: AdminListLayoutProps) {
  return (
    <>
      {breadcrumbs && <AdminBreadcrumbs breadcrumbs={breadcrumbs} />}
      <Card>
        <Heading level={2}>{title}</Heading>
        {description && <Text>{description}</Text>}
        
        {tableContent && (
          <div className="mt-4">
            {tableContent}
          </div>
        )}
      </Card>
    </>
  );
}