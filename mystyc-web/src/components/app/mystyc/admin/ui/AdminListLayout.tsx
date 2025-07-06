'use client';

import { ReactNode } from 'react';

import Card from '@/components/ui/Card';
import { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Avatar from '@/components/ui/Avatar';
import { IconComponent } from '@/components/ui/icons/Icon';

interface AdminListLayoutProps {
  icon: IconComponent
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  total: number;
  description?: string;
  sideContent?: ReactNode;
  itemContent?: ReactNode[],
  tableContent?: ReactNode;
}

export default function AdminListLayout({ 
  breadcrumbs, 
  icon, 
  title, 
  total, 
  description, 
  sideContent, 
  itemContent, 
  tableContent 
}: AdminListLayoutProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row mb-4">
        <Card className='grow'>
          <div className='flex space-x-3 items-center mb-4'>
            {icon && (
              <div className='mt-1'>
                <Avatar size={'medium'} icon={icon} />
              </div>
            )}
            {breadcrumbs ? (
              <AdminBreadcrumbs breadcrumbs={breadcrumbs} />
            ) : (
              <Heading level={2}>{title}</Heading>
            )}
          </div>

          <hr />

          <div className='flex items-center mt-4'>
            {description && <Text>{description}</Text>}
          </div>
        </Card>

        <Card className='sm:ml-4 mt-4 sm:mt-0 min-w-44 lg:min-w-64'>
          {sideContent}
        </Card>
      </div>

      {itemContent && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[12em]'>
          {itemContent.map((item, index) => (
            <Card key={index}>
              {item}
            </Card>
          ))}
        </div>
      )}

      {tableContent && (
        <Card className='mt-4'>
          {tableContent}
        </Card>
      )}
    </>
  );
}