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
  title?: string;
  description?: string;
  headerContent?: ReactNode;
  sideContent?: ReactNode;
  itemsContent?: ReactNode | ReactNode[];
  mainContent?: ReactNode | ReactNode[];
}

export default function AdminListLayout({ 
  error,
  onRetry,
  breadcrumbs, 
  icon, 
  title, 
  description, 
  headerContent,
  sideContent, 
  itemsContent, 
  mainContent 
}: AdminListLayoutProps) {

  const gridCols = Array.isArray(itemsContent) && itemsContent && itemsContent.length > 0 ? itemsContent.length : 1;

  if (error) {
    return (
      <div className='grow w-full flex p-0 sm:p-1 sm:pb-0 sm:mr-2'>
        <Card padding={4} className="grow w-full">
          <div className='flex space-x-3 items-center mb-2'>
            {icon && <Avatar size={'small'} icon={icon} className='-mt-[2.5px]' />}
            {breadcrumbs ? (
              <AdminBreadcrumbs breadcrumbs={breadcrumbs} />
            ) : (
              <Heading level={3}>{title}</Heading>
            )}
          </div>
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
    <div className='w-full flex grow p-0 sm:p-1 sm:pb-0 sm:pr-2'>
      <Card padding={4} className="grow w-full max-h-[calc(100dvh_-_112px)] overflow-hidden">
        <div className='flex w-full'>
          <div className='flex flex-col w-full space-y-1'>
            <div className='flex flex-row w-full'>
              <div className='flex space-x-3 items-center flex-1'>
                {icon && <Avatar size={'small'} icon={icon} className='-mt-[2.5px]' />}
                {breadcrumbs ? (
                  <AdminBreadcrumbs breadcrumbs={breadcrumbs} />
                ) : (
                  <Heading level={3}>{title}</Heading>
                )}
              </div>
              {sideContent &&
                <div className='sm:ml-1 mt-1 sm:-mt-1 min-w-44 hidden sm:flex'>
                  {sideContent}
                </div>
              }
            </div>
            {(headerContent || description) &&
              <div className='w-full grow flex flex-col overflow-hidden pt-2'>
                {headerContent ? (
                  <>{headerContent}</>
                ) : (
                  <>{description && <Text>{description}</Text>}</>
                )}
              </div>
            }
          </div>
        </div>
        {itemsContent && (
          Array.isArray(itemsContent) ? (
            <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-1 !mb-2`}>
              {itemsContent.map((item, index) => (
                <div key={index}>{item}</div>
              ))}
            </div>
          ) : (
            <>{itemsContent}</>
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
