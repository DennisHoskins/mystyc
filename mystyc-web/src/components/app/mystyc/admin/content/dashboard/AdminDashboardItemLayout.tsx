'use client';

import { ReactNode } from 'react';

import Card from '@/components/ui/Card';
import AdminDashboardHeader from './AdminDashboardHeader';

interface DashboardItemLayoutProps {
  icon: ReactNode;
  title: string;
  link?: string | null;
  children: ReactNode;
}

export default function AdminDashboardItemLayout({
  icon,
  title,
  link,
  children
}: DashboardItemLayoutProps) {
  return (
    <Card className="@container">
      <AdminDashboardHeader
        icon={icon}
        title={title}
        link={link}
      />

      <hr />
      
      <div className="space-y-6 pt-4 mt-2 flex flex-1">
        {children}
      </div>
    </Card>
  );
}