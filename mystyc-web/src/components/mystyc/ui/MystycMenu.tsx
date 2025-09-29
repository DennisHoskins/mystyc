import MenuItem from '@/components/ui/layout/menu/MenuItem';

import { LogOut } from 'lucide-react';
import { useUser } from '@/components/ui/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

import AdminMenu from '@/components/admin/ui/AdminMenu';

export default function MystycMenu() {
  const user = useUser();
  const router = useTransitionRouter();

  if (!user) {
    return null;
  }

  return (
    <>
      {user.isAdmin && (
        <div className='h-full border-b border-[#ffffff24] mb-4'>
          <div className='pt-4'>
            <AdminMenu />
          </div>
        </div>
      )}

      <div className="mt-auto">
        <MenuItem className='pb-0' onClick={() => router.push('/logout')}>
          <LogOut className="inline-block mr-2 h-4 w-4" />
          Logout
        </MenuItem>
      </div>
    </>
  );
}