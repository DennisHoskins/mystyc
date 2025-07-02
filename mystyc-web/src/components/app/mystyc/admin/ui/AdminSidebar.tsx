'use client';

import { LayoutDashboard, Users, MonitorSmartphone, Shield, Bell, Activity } from 'lucide-react';

import Sidebar from '@/components/ui/sidebar/Sidebar';
import SidebarItem from '@/components/ui/sidebar/SidebarItem';

interface AdminSidebarProps {
  isOpen?: boolean;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function AdminSidebar({ 
  isOpen = true, 
  isCollapsed = false,
  onToggle = () => {},
}: AdminSidebarProps) {
  const menuItems = [
    { icon: <LayoutDashboard />, label: 'Dashboard', href: '/admin' },
    { icon: <Activity />, label: 'Sessions', href: '/admin/sessions' },
    { icon: <Users />, label: 'Users', href: '/admin/users' },
    { icon: <MonitorSmartphone />, label: 'Devices', href: '/admin/devices' },
    { icon: <Shield />, label: 'Authentication', href: '/admin/authentication' },
    { icon: <Bell />, label: 'Notifications', href: '/admin/notifications' },
  ];

  return (
    <Sidebar 
      isOpen={isOpen} 
      isCollapsed={isCollapsed} 
      onToggle={onToggle} 
    >
      {menuItems.map((item) => (
        <SidebarItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          isCollapsed={isCollapsed}
        />
      ))}
    </Sidebar>
  );
}