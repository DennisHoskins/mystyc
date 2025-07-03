'use client';

import { ReactNode } from 'react';

import Card from '@/components/ui/Card';
import { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { IconComponent } from '@/components/ui/icons/Icon';

interface AdminListLayoutProps {
  breadcrumbs?: BreadcrumbItem[];
  icon: IconComponent
  title: string;
  total: number;
  description?: string;
  tableContent?: ReactNode;
}

export default function AdminListLayout({ breadcrumbs, icon, title, total, description, tableContent }: AdminListLayoutProps) {
  return (
    <>
      {breadcrumbs && <AdminBreadcrumbs breadcrumbs={breadcrumbs} />}
      <Card>
        <div className='flex space-x-3 items-center mb-4'>
          {icon && (
            <div className='mt-1'>
              <Avatar size={'medium'} icon={icon} />
            </div>
          )}
          <Heading level={2}>{title}</Heading>
        </div>
        
        <hr />

        <div className='flex items-center mt-4'>
          {description && <Text>{description}</Text>}
          {total > 0 && <Badge total={total} className='ml-auto'/>}
        </div>
        
        {tableContent && (
          <div className="mt-4">
            {tableContent}
          </div>
        )}
      </Card>
    </>
  );
}