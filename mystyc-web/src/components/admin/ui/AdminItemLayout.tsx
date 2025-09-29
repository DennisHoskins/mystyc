'use client'

import { ReactNode } from 'react';

import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminBreadcrumbs from '@/components/admin/ui/AdminBreadcrumbs';
import AdminError from '@/components/admin/ui/AdminError';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminItemLayoutProps {
  error?: string | null;
  onRetry?: () => void;
  breadcrumbs: Breadcrumb[];
  icon: ReactNode;
  title: string;
  headerContent?: ReactNode | null;
  itemsContent?: ReactNode[] | null;
  sideContent?: ReactNode | null;
  mainContent?: ReactNode | null;
}

export default function AdminItemLayout({
  error,
  onRetry,
  breadcrumbs,
  icon,
  title,
  headerContent,
  itemsContent,
  sideContent,
  mainContent
}: AdminItemLayoutProps) {

  if (error) {
    return (
      <div className='grow flex-1 min-h-0 flex flex-col p-0 sm:p-1 sm:pb-0 sm:pr-2'>
        <Card padding={4} className='flex-1'>
          <div className='flex space-x-3 items-center pb-2 border border-purple-950'>
            {icon && <Avatar size={'small'} icon={icon} className='-mt-[2.5px]' />}
            {breadcrumbs ? (
              <AdminBreadcrumbs breadcrumbs={breadcrumbs} />
            ) : (
              <Heading level={3}>{title}</Heading>
            )}
          </div>
          <div className='w-full h-full flex flex-col items-center justify-center'>
            <AdminError
              title={title}
              error={error} 
              onRetry={onRetry}
            />
          </div>
        </Card>
      </div>
    )
  }

  if (!sideContent || (Array.isArray(sideContent) && !sideContent.length)) {

    const headClass = itemsContent || mainContent ? "" : "flex-1";

    return (
      <div className='grow w-full min-h-0 flex flex-col p-0 sm:p-1 sm:pb-0 sm:pr-2'>
        <Card padding={4} className={headClass}>
          <div className='flex space-x-3 items-center border border-purple-950'>
            {icon && <Avatar size={'small'} icon={icon} className='-mt-[2.5px]' />}
            {breadcrumbs ? (
              <AdminBreadcrumbs breadcrumbs={breadcrumbs} />
            ) : (
              <Heading level={3}>{title}</Heading>
            )}
          </div>
          <div className='pt-2'>
            {headerContent}
          </div>            
        </Card>
        {itemsContent &&
          <div className={`mt-1 flex-1 w-full grow flex`}>
            {itemsContent}
          </div>
        }
        {mainContent && (
          <div className="mt-1 space-y-1 flex flex-col flex-1">
            {mainContent}
          </div>
        )}
      </div>
    );
  }

  const hasX = sideContent != null;
  const hasY = itemsContent != null;
  const gap = hasX && hasY ? "gap-1" : hasX ? "gap-x-1" : "gap-y-1"
  const rows = itemsContent || (!itemsContent && !mainContent) ? 'row-span-2' : 'row-span-1';
  const rowClass = itemsContent || mainContent ? "h-auto" : "h-full row-span-2";

  return (
    <div className='grow w-full min-h-0 flex flex-col p-0 sm:p-1 sm:pb-0 sm:pr-2'>
      <div className={`flex-1 grid grid-cols-1 lg:grid-cols-3 ${gap} lg:space-y-0 grid-rows-[auto_1fr]`}>

        <Card padding={4} className={`order-1 lg:col-span-2 ${rowClass}`}>
          <div className='flex space-x-2 items-center'>
            {icon && <Avatar size={'small'} icon={icon} className='-mt-[2.5px]' />}
            {breadcrumbs ? (
              <AdminBreadcrumbs breadcrumbs={breadcrumbs} />
            ) : (
              <Heading level={3}>{title}</Heading>
            )}
          </div>
          <div className='pt-1'>
            {headerContent}
          </div>
        </Card>
        {Array.isArray(sideContent) 
          ? <div className={`order-3 lg:order-2 lg:col-span-1 ${rows} space-y-1 flex-1 grow flex flex-col`}>
              {sideContent}
            </div>
          : <Card padding={4} className={`order-3 lg:order-2 lg:col-span-1 ${rows}`}>
              {sideContent}
            </Card>
        }
        {itemsContent &&
          <div className={`order-2 lg:order-3 lg:col-span-2 space-y-1 flex-1 grow flex flex-col w-full`}>
            {itemsContent}
          </div>
        }
      </div>
      {mainContent && (
        <div className="mt-1 space-y-1 grow min-h-0 flex flex-col">
          {mainContent}
        </div>
      )}
    </div>
  );
}