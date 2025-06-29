import { ReactNode } from 'react';
import AdminBreadcrumbs from '@/components/app/mystyc/admin/ui/AdminBreadcrumbs';
import Heading from '@/components/ui/Heading';
import Card from '@/components/ui/Card';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminDetailLayoutProps {
  breadcrumbs: Breadcrumb[];
  title: string;
  headerContent: ReactNode;
  mainContent: ReactNode;
  sidebarContent: ReactNode;
  tabsContent?: ReactNode;
}

export default function AdminDetailLayout({
  breadcrumbs,
  title,
  headerContent,
  mainContent,
  sidebarContent,
  tabsContent
}: AdminDetailLayoutProps) {
  return (
    <>
      <AdminBreadcrumbs breadcrumbs={breadcrumbs} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="h-60 order-1 lg:col-span-2 lg:order-none">
          <Heading level={2}>{title}</Heading>
          <div className="space-y-1 mt-2">
            {headerContent}
          </div>
        </Card>

        <Card className="h-full order-2 lg:col-span-1 lg:order-none lg:row-span-2">
          {sidebarContent}
        </Card>

        <Card className="h-[17rem] order-3 lg:col-span-2 lg:order-none">
          {mainContent}
        </Card>
      </div>

      {tabsContent && (
        <div className="mt-4">
          {tabsContent}
        </div>
      )}
    </>
  );
}