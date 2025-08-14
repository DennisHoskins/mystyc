import { ReactNode } from 'react';

import Card from '@/components/ui/Card';
import AdminDashboardHeader from './AdminDashboardHeader';

interface DashboardItemLayoutProps {
  icon: ReactNode;
  title: string;
  link?: string | null;
  children: ReactNode;
  className?: string | null;
  stats?: ReactNode | null;
}

export default function AdminDashboardItemLayout({
  icon,
  title,
  link,
  children,
  className,
  stats
}: DashboardItemLayoutProps) {
  return (
    <Card className={`@container grow ${className}`}>
      <AdminDashboardHeader
        icon={icon}
        title={title}
        link={link}
        stats={stats}
      />
      <hr />
      <div className="flex flex-1 flex-col pt-2">
        {children}
      </div>
    </Card>
  );
}