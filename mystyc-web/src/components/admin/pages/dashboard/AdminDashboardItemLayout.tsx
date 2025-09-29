import { ReactNode } from 'react';

import AdminCard from '../../ui/AdminCard';

interface DashboardItemLayoutProps {
  icon: ReactNode;
  title: string;
  link?: string;
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
    <AdminCard
      icon={icon}
      title={title}
      href={link}
      tag={stats}
      className={`@container grow ${className}`}
    >
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </AdminCard>
  );
}