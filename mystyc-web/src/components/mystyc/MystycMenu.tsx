'use client'

import MenuItems from '@/components/ui/layout/menu/MenuItems';
import MenuItem from '@/components/ui/layout/menu/MenuItem';

import { User, Settings, CreditCard, LayoutDashboard, LogOut } from 'lucide-react';
import { useUser } from '@/components/ui/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

import AdminMenu from '@/components/mystyc/admin/ui/AdminMenu';

export default function MystycMenu() {
  const user = useUser();
  const router = useTransitionRouter();

  if (!user) {
    return null;
  }

  if (!user.isOnboard) {
    return (
      <>
        <div className='h-full'>
          {user.isAdmin && (
            <div className='h-full mb-4 border-b '>
              <div className='pb-4 block md:hidden'>
                <AdminMenu />
              </div>
              <div className='pb-4 hidden md:block'>
                <MenuItem className='mt-auto pb-0 items-end' onClick={() => router.push('/admin')}>
                  <LayoutDashboard className="inline-block mr-2 h-4 w-4" />
                  Admin Dashboard
                </MenuItem>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <MenuItem className='mt-auto pb-0 items-end' onClick={() => router.push('/logout')}>
            <LogOut className="inline-block mr-2 h-4 w-4" />
            Logout
          </MenuItem>
        </div>
      </>
    )    
  }

  return (
    <>
      <div className='pb-4'>
        <MenuItems>
          <MenuItem onClick={() => router.push('/profile')}>
            <User className="inline-block mr-2 h-4 w-4" />
            Profile
          </MenuItem>
          <MenuItem onClick={() => router.push('/account')}>
            <CreditCard className="inline-block mr-2 h-4 w-4" />
            Account
          </MenuItem>
          <MenuItem onClick={() => router.push('/settings')}>
            <Settings className="inline-block mr-2 h-4 w-4" />
            Settings
          </MenuItem>
        </MenuItems>
      </div>

      {user.isAdmin && (
        <div className='h-full'>
          <div className='pt-4 pb-4 sm:hidden border-t'>
            <AdminMenu />
          </div>
          <div className='pt-4 pb-4 hidden sm:block border-t'>
            <MenuItem className='mt-auto pb-0 items-end' onClick={() => router.push('/admin')}>
              <LayoutDashboard className="inline-block mr-2 h-4 w-4" />
              Admin Dashboard
            </MenuItem>
          </div>
        </div>
      )}

      <div className="mt-auto pt-4 border-t">
        <MenuItem className='pb-0' onClick={() => router.push('/logout')}>
          <LogOut className="inline-block mr-2 h-4 w-4" />
          Logout
        </MenuItem>
      </div>
    </>
  );
}