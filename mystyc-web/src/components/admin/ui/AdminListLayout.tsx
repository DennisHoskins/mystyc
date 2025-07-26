'use client';

import { ReactNode } from 'react';

import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Avatar from '@/components/ui/Avatar';
import { IconComponent } from '@/components/ui/icons/Icon';
import { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import AdminError from '@/components/admin/ui/AdminError';

interface AdminListLayoutProps {
  error?: string | null;
  onRetry: () => void;
  icon: IconComponent | React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  button?: ReactNode | null,
  title?: string;
  description?: string;
  headerContent?: ReactNode;
  sideContent?: ReactNode;
  itemContent?: ReactNode | ReactNode[];
  tableContent?: ReactNode | ReactNode[];
}

export default function AdminListLayout({ 
  error,
  onRetry,
  breadcrumbs, 
  icon, 
  button, 
  title, 
  description, 
  headerContent,
  sideContent, 
  itemContent, 
  tableContent 
}: AdminListLayoutProps) {

  const gridCols = Array.isArray(itemContent) && itemContent && itemContent.length > 0 ? itemContent.length : 1;

  if (error) {
    return (
      <>
        <div className="flex flex-col mt-4 mr-2 mb-4">
          <Card className='grow mb-4'>
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
          </Card>
          <AdminError 
            title={"Unable to load data"}
            error={error} 
            onRetry={onRetry}
          />
        </div>
      </>
    );
  }

  return (
    <div className='grow min-h-0 flex flex-col mt-4 mr-2 mb-4'>
      <div className="flex flex-col sm:flex-row mb-4">
        <Card className='grow'>
          <div className='flex space-x-3 items-center mb-4'>
            {icon && (
              <div className='mt-1'>
                <Avatar size={'small'} icon={icon} />
              </div>
            )}
            {breadcrumbs ? (
              <AdminBreadcrumbs breadcrumbs={breadcrumbs} />
            ) : (
              <Heading level={2}>{title}</Heading>
            )}
            <div className='flex-1 flex justify-end'>
              {button}
            </div>
          </div>

          <hr />

          <div className='w-full flex mt-4'>
            {headerContent ? (
              <>{headerContent}</>
            ) : (
              <>{description && <Text>{description}</Text>}</>
            )}
            
          </div>
        </Card>

        <Card className='sm:ml-4 mt-4 sm:mt-0 min-w-44 lg:min-w-64'>
          {sideContent}
        </Card>
      </div>

      {itemContent && (
        Array.isArray(itemContent) ? (
          <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-4 mb-4`}>
            {itemContent.map((item, index) => (
              <Card key={index}>{item}</Card>
            ))}
          </div>
        ) : (
          <>{itemContent}</>
        )
      )}

      {tableContent && (
        <div className='space-y-4 flex-1 flex flex-col grow min-h-0 overflow-hidden'>  
          {Array.isArray(tableContent) ? (
            tableContent.map((content, index) => (
              <Card key={index} className='grow min-h-0 overflow-hidden'>
                {content}
              </Card>
            ))
          ) : (
            <Card className='grow min-h-0 overflow-hidden flex'>{tableContent}</Card>
          )}
        </div>
      )}
    </div>
  );
}
