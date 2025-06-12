import React from 'react';

import AdminHeader from '@/components/admin/AdminHeader';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { BreadcrumbItem } from '../ui/Breadcrumbs';

interface AdminDetailLayoutProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle: string;
  loading: boolean;
  error: string | null;
  loadingTitle?: string;
  loadingSubtitle?: string;
  notFoundTitle?: string;
  notFoundSubtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export default function AdminDetailLayout({
  breadcrumbs,
  title,
  subtitle,
  loading,
  error,
  loadingTitle = "Loading...",
  loadingSubtitle = "Loading details",
  notFoundTitle = "Not Found",
  notFoundSubtitle = "The requested item could not be found",
  children,
  action,
}: AdminDetailLayoutProps) {
  if (loading) {
    return (
      <>
        <div className="space-y-8 pb-6">
          <AdminBreadcrumbs items={[
            ...breadcrumbs.slice(0, -1),
            { label: 'Loading...' }
          ]} />
          <AdminHeader title={loadingTitle} subtitle={loadingSubtitle} />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="space-y-8 pb-6">
          <AdminBreadcrumbs items={[
            ...breadcrumbs.slice(0, -1),
            { label: 'Not Found' }
          ]} />
          <AdminHeader title={notFoundTitle} subtitle={notFoundSubtitle} />
          <div className="text-center text-red-600 mt-4">{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-8 pb-6">
        <AdminBreadcrumbs items={breadcrumbs} />
        <div className="flex items-center justify-between">
          <AdminHeader title={title} subtitle={subtitle} />
          {action && <div>{action}</div>}
        </div>
        {children}
      </div>
    </>
  );
}