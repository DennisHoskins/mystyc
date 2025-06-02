import React from 'react';

import PageContainer from '@/components/layout/PageContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';

interface AdminListLayoutProps {
  breadcrumbLabel: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export default function AdminListLayout({
  breadcrumbLabel,
  title,
  subtitle,
  children,
  className = '',
  action,
}: AdminListLayoutProps) {
  return (
    <PageContainer>
      <div className={`space-y-6 ${className}`}>
        <AdminBreadcrumbs items={[{ label: breadcrumbLabel }]} />
        
        <div className="flex items-center justify-between">
          <AdminHeader title={title} subtitle={subtitle} />
          {action && <div>{action}</div>}
        </div>
        
        <div className="mt-4 w-full">
          {children}
        </div>
      </div>
    </PageContainer>
  );
}