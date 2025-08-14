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
      <div className='grow flex-1 min-h-0 flex flex-col mt-4 mr-4 ml-4'>
        <Card className='flex-1'>
          <div className='flex space-x-3 items-center overflow-hidden'>
            {icon && <Avatar size={'small'} icon={icon} className='-mt-[2.5px]' />}
            {breadcrumbs ? (
              <AdminBreadcrumbs breadcrumbs={breadcrumbs} />
            ) : (
              <Heading level={3}>{title}</Heading>
            )}
          </div>
          <hr />
          <AdminError
            title={title}
            error={error} 
            onRetry={onRetry}
          />
        </Card>
      </div>
    )
  }

  if (!sideContent) {

    const headClass = itemsContent || mainContent ? "" : "flex-1";

    return (
      <div className='grow w-full min-h-0 flex flex-col p-4 pb-0'>
        <Card className={headClass}>
          <div className='flex space-x-3 items-center overflow-hidden'>
            {icon && <Avatar size={'small'} icon={icon} className='-mt-[2.5px]' />}
            {breadcrumbs ? (
              <AdminBreadcrumbs breadcrumbs={breadcrumbs} />
            ) : (
              <Heading level={3}>{title}</Heading>
            )}
          </div>
          <hr />
          <div className='pt-1'>
            {headerContent}
          </div>            
        </Card>
        {itemsContent &&
          <div className={`mt-4 flex-1 w-full grow flex`}>
            {itemsContent}
          </div>
        }
        {mainContent && (
          <div className="mt-4 space-y-4 flex flex-col flex-1">
            {mainContent}
          </div>
        )}
      </div>
    );
  }

  const hasX = sideContent != null;
  const hasY = itemsContent != null;
  const gap = hasX && hasY ? "gap-4" : hasX ? "gap-x-4" : "gap-y-4"
  const rows = itemsContent || (!itemsContent && !mainContent) ? 'row-span-2' : 'row-span-1';
  const rowClass = itemsContent || mainContent ? "h-auto" : "h-full row-span-2";

  return (
    <div className='grow w-full min-h-0 flex flex-col p-4 pb-0'>
      <div className={`flex-1 grid grid-cols-1 lg:grid-cols-3 ${gap} lg:space-y-0 grid-rows-[auto_1fr]`}>

        <Card className={`order-1 lg:col-span-2 ${rowClass}`}>
          <div className='flex space-x-3 items-center overflow-hidden'>
            {icon && <Avatar size={'small'} icon={icon} className='-mt-[2.5px]' />}
            {breadcrumbs ? (
              <AdminBreadcrumbs breadcrumbs={breadcrumbs} />
            ) : (
              <Heading level={3}>{title}</Heading>
            )}
          </div>
          <hr />
          <div className='pt-1'>
            {headerContent}
          </div>
        </Card>
        {Array.isArray(sideContent) 
          ? <div className={`order-2 lg:col-span-1 ${rows} space-y-4 flex-1 grow flex flex-col`}>
              {sideContent}
            </div>
          : <Card className={`order-2 lg:col-span-1 ${rows} mt-4 lg:mt-0`}>
              {sideContent}
            </Card>
        }
        {itemsContent &&
          <div className={`order-3 lg:col-span-2 space-y-4 flex-1 grow flex flex-col w-full`}>
            {itemsContent}
          </div>
        }
      </div>
      {mainContent && (
        <div className="mt-4 space-y-4 grow min-h-0 flex flex-col">
          {mainContent}
        </div>
      )}
    </div>
  );
}