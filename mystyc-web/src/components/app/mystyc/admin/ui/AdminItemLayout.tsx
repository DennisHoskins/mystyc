import { ReactNode } from 'react';

import AdminBreadcrumbs from '@/components/app/mystyc/admin/ui/AdminBreadcrumbs';
import AdminError from '@/components/app/mystyc/admin/ui/AdminError';
import Heading from '@/components/ui/Heading';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminDetailLayoutProps {
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

export default function AdminDetailLayout({
  error,
  onRetry,
  breadcrumbs,
  icon,
  title,
  headerContent,
  sectionsContent,
  sidebarContent,
  mainContent
}: AdminDetailLayoutProps) {

  if (error) {
    return (
      <>
        <Card className='mb-4'>
          <div className='flex space-x-3 items-center mb-4 overflow-hidden'>
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
          title={title}
          error={error} 
          onRetry={onRetry}
        />
      </>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className={`order-1 lg:col-span-2 lg:order-none`}>
          <div className='flex space-x-3 items-center mb-4 overflow-hidden'>
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

          <div className="space-y-1 mt-4">
            {headerContent}
          </div>
        </Card>

        {sidebarContent && (
          <Card className="h-full order-2 lg:col-span-1 lg:order-none lg:row-span-2">
            {sidebarContent}
          </Card>
        )}

        <div className={`order-3 lg:col-span-2 lg:order-none space-y-4 flex-1 grow`}>
          {sectionsContent}
        </div>
      </div>

      {mainContent && (
        <div className="mt-4">
          {mainContent}
        </div>
      )}
    </>
  );
}