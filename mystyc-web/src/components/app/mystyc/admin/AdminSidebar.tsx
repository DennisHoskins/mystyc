'use client';

import { Home, Users, Monitor, Shield, Bell, Activity } from 'lucide-react';
import { usePathname } from 'next/navigation';
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
}: AdminSidebarProps) {
 const pathname = usePathname();

 const menuItems = [
   { icon: <Home />, label: 'Home', href: '/admin' },
   { icon: <Activity />, label: 'Sessions', href: '/admin/sessions' },
   { icon: <Users />, label: 'Users', href: '/admin/users' },
   { icon: <Monitor />, label: 'Devices', href: '/admin/devices' },
   { icon: <Shield />, label: 'Authorization', href: '/admin/authorization' },
   { icon: <Bell />, label: 'Notifications', href: '/admin/notifications' },
 ];

 return (
   <Sidebar isOpen={isOpen} isCollapsed={isCollapsed}>
     {menuItems.map((item) => (
       <SidebarItem
         key={item.href}
         icon={item.icon}
         label={item.label}
         href={item.href}
         isActive={pathname === item.href}
         isCollapsed={isCollapsed}
       />
     ))}
   </Sidebar>
 );
}