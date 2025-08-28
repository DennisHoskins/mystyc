'use client'

import { LayoutDashboard, Clock, BookOpenText, CircleDollarSign, Globe, Sparkle, SunMoon, Users, MonitorSmartphone, Shield, Bell, Activity } from 'lucide-react';

import Sidebar from '@/components/ui/layout/sidebar/Sidebar';
import SidebarItem from '@/components/ui/layout/sidebar/SidebarItem';

export default function MystycSidebar() {
  const menuItems = [
    { icon: <LayoutDashboard />, label: 'Dashboard', href: '/admin' },
    { icon: <Activity />, label: 'Sessions', href: '/admin/sessions' },
    { icon: <Globe />, label: 'Traffic', href: '/admin/traffic' },
    { icon: <Sparkle />, label: 'OpenAI Usage', href: '/admin/openai' },
    { icon: <CircleDollarSign />, label: 'Subscriptions', href: '/admin/subscriptions' },
    { icon: <SunMoon />, label: 'Astrology', href: '/admin/astrology' },
    { icon: <BookOpenText />, label: 'Content', href: '/admin/content' },
    { icon: <Clock />, label: 'Schedules', href: '/admin/schedules' },
    { icon: <Users />, label: 'Users', href: '/admin/users' },
    { icon: <MonitorSmartphone />, label: 'Devices', href: '/admin/devices' },
    { icon: <Bell />, label: 'Notifications', href: '/admin/notifications' },
    { icon: <Shield />, label: 'Authentication', href: '/admin/authentication' },
  ];

  return (
    <Sidebar isCollapsed={false}>
      {menuItems.map((item) => (
        <SidebarItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          isCollapsed={false}
        />
      ))}
    </Sidebar>
  );
}