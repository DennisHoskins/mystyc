'use client';

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
  onRetry: () => void;
  breadcrumbs: Breadcrumb[];
  icon: ReactNode;
  title: string;
  headerContent?: ReactNode | null;
  sectionsContent?: ReactNode[] | null;
  sidebarContent?: ReactNode | null;
  mainContent?: ReactNode | null;
}

export default function AdminItemLayout({
  error,
  onRetry,
  breadcrumbs,
  icon,
  title,
  headerContent,
  sectionsContent,
  sidebarContent,
  mainContent
}: AdminItemLayoutProps) {

  if (error) {
    return (
      <>
        <Card className='mb-4'>
          <div className='flex space-x-3 items-center mb-4 overflow-hidden'>
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
          </div>
        </Card>
        <AdminError 
          title={title}
          error={error} 
          onRetry={onRetry}
        />
      </>
    )
  }

  if (!sidebarContent) {
    return (
      <>
        <Card>
          <div className='flex space-x-3 items-center mb-4 overflow-hidden'>
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
          </div>

          <hr />

          <div className="mt-4">
            {headerContent}
          </div>
        </Card>

        {sectionsContent &&
          <div className={`mt-4`}>
            {sectionsContent}
          </div>
        }

        {mainContent && (
          <div className="mt-4 space-y-4 flex-1 flex flex-col">
            {mainContent}
          </div>
        )}
      </>
    );
  }

  const hasX = sidebarContent != null;
  const hasY = sectionsContent != null;
  const gap = hasX && hasY ? "gap-4" : hasX ? "gap-x-4" : "gap-y-4"
  const rows = sectionsContent ? 2 : 1;

  return (
    <>
      <div className={`grid grid-cols-1 lg:grid-cols-3 ${gap} lg:space-y-0`}>

        <Card className={`order-1 lg:col-span-2`}>
          <div className='flex space-x-3 items-center mb-4 overflow-hidden'>
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
          </div>

          <hr />

          <div className="space-y-1 mt-4">
            {headerContent}
          </div>
        </Card>

        <Card className={`order-2 lg:col-span-1 lg:row-span-${rows}`}>
          {sidebarContent}
        </Card>

        <div className={`order-3 lg:col-span-2 space-y-4 flex-1 grow`}>
          {sectionsContent}
        </div>
      </div>

      {mainContent && (
        <div className="mt-4 space-y-4 flex-1 flex flex-col">
          {mainContent}
        </div>
      )}
    </>
  );
}