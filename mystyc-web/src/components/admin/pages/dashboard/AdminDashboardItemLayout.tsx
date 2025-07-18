'use client';

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
    <Card className={`@container grow ${className}`}>
      <AdminDashboardHeader
        icon={icon}
        title={title}
        link={link}
      />

      <hr />
      
      <div className="space-y-2 pt-4 flex flex-1 flex-col">
        {children}
      </div>
    </Card>
  );
}