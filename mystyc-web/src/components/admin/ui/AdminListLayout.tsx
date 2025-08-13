'use client'

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
  mainContent?: ReactNode | ReactNode[];
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
  mainContent 
}: AdminListLayoutProps) {

  const gridCols = Array.isArray(itemContent) && itemContent && itemContent.length > 0 ? itemContent.length : 1;

  if (error) {
    return (
      <div className='grow w-full flex p-4 pb-0'>
        <Card className="grow w-full flex flex-col">
          <div className='flex space-x-3 items-center'>
            {icon && (
              <div className='mt-1'>
                <Avatar size={'medium'} icon={icon} />
              </div>
            )}
            {breadcrumbs ? (
              <AdminBreadcrumbs breadcrumbs={breadcrumbs} />
            ) : (
              <Heading level={3}>{title}</Heading>
            )}
          </div>
          <hr />
          <AdminError 
            title={"Unable to load data"}
            error={error} 
            onRetry={onRetry}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className='w-full flex p-4 pb-0 grow'>
      <Card className="grow w-full flex flex-col max-h-[calc(100dvh_-_125px)] overflow-hidden">

        <div className='flex w-full'>

          <div className='flex flex-col w-full space-y-2'>
            <div className='flex space-x-3 items-center'>
              {icon && (
                <div className='mt-1'>
                  <Avatar size={'small'} icon={icon} />
                </div>
              )}
              {breadcrumbs ? (
                <AdminBreadcrumbs breadcrumbs={breadcrumbs} />
              ) : (
                <Heading level={3}>{title}</Heading>
              )}
              <div className='flex-1 flex justify-end'>
                {button}
              </div>
            </div>

            <hr />

            <div className='w-full grow flex overflow-hidden'>
              {headerContent ? (
                <>{headerContent}</>
              ) : (
                <>{description && <Text>{description}</Text>}</>
              )}
            </div>
          </div>
            
          {sideContent &&
            <div className='sm:ml-4 mt-4 sm:mt-0 min-w-44 lg:min-w-64 flex'>
              {sideContent}
            </div>
          }

        </div>

        {itemContent && (
          Array.isArray(itemContent) ? (
            <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-4 mb-4`}>
              {itemContent.map((item, index) => (
                <div key={index}>{item}</div>
              ))}
            </div>
          ) : (
            <>{itemContent}</>
          )
        )}

        {mainContent && (
          <div className='flex-1 grow min-h-0 flex flex-col overflow-hidden'>  
            {mainContent}
          </div>
        )}
      </Card>
    </div>
  );
}
