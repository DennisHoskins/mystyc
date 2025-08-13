import { ReactNode } from 'react';

import Card from '@/components/ui/Card';
import AdminDashboardHeader from './AdminDashboardHeader';

interface DashboardItemLayoutProps {
  icon: ReactNode;
  title: string;
  link?: string | null;
  children: ReactNode;
  className?: string | null;
}

export default function AdminDashboardItemLayout({
  icon,
  title,
  link,
  children,
  className,
}: DashboardItemLayoutProps) {
  return (
    <Card className={`@container grow ${className} space-y-2`}>
      <AdminDashboardHeader
        icon={icon}
        title={title}
        link={link}
      />

      <hr />
      
      <div className="space-y-2 flex flex-1 flex-col pt-2">
        {children}
      </div>
    </Card>
  );
}