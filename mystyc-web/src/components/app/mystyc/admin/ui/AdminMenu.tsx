'use client'

import { LayoutDashboard, Clock, Hash, Globe, Users, MonitorSmartphone, Shield, Bell, Activity } from 'lucide-react';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';

import MenuItems from '@/components/layout/menu/MenuItems';
import MenuItem from '@/components/layout/menu/MenuItem';

export default function AdminMenu() {
  const router = useTransitionRouter();

  return (
    <div className='pb-4'>
      <MenuItems>
        <MenuItem onClick={() => router.push('/admin')}>
          <LayoutDashboard className="inline-block mr-2 h-4 w-4" />
          Admin Dashboard
        </MenuItem>
        <MenuItem onClick={() => router.push('/admin/sessions')}>
          <Activity className="inline-block mr-2 h-4 w-4" />
          Sessions
        </MenuItem>
        <MenuItem onClick={() => router.push('/admin/traffic')}>
          <Globe className="inline-block mr-2 h-4 w-4" />
          Traffic
        </MenuItem>
        <MenuItem onClick={() => router.push('/admin/schedules')}>
          <Clock className="inline-block mr-2 h-4 w-4" />
          Schedules
        </MenuItem>
        <MenuItem onClick={() => router.push('/admin/content')}>
          <Hash className="inline-block mr-2 h-4 w-4" />
          Content
        </MenuItem>
        <MenuItem onClick={() => router.push('/admin/users')}>
          <Users className="inline-block mr-2 h-4 w-4" />
          Users
        </MenuItem>
        <MenuItem onClick={() => router.push('/admin/devices')}>
          <MonitorSmartphone className="inline-block mr-2 h-4 w-4" />
          Devices
        </MenuItem>
        <MenuItem onClick={() => router.push('/admin/authentication')}>
          <Shield className="inline-block mr-2 h-4 w-4" />
          Authentication
        </MenuItem>
        <MenuItem onClick={() => router.push('/admin/notifications')}>
          <Bell className="inline-block mr-2 h-4 w-4" />
          Notifications
        </MenuItem>
      </MenuItems>
    </div>
  )
}
