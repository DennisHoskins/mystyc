'use client';

import Card from '@/components/ui/Card';
import { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

interface AdminHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  children?: React.ReactNode
}

export default function AdminHeader({ breadcrumbs, title, description, children }: AdminHeaderProps) {
  return (
    <>
      {breadcrumbs && <AdminBreadcrumbs breadcrumbs={breadcrumbs} />}
      <Card>
        <Heading level={2}>{title}</Heading>
        {description && <Text>{description}</Text>}
        {children}
      </Card>
    </>
  );
}