'use client'

import { useState } from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import Header from '@/components/ui/layout/Header';
import MystycMenuButton from '@/components/mystyc/ui/MystycMenuButton';
import Menu from '@/components/ui/layout/menu/Menu';

export default function MystycHeader({ user } : {user: AppUser }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Header user={user}>
        <MystycMenuButton 
          menuOpen={menuOpen} 
          setMenuOpen={setMenuOpen} 
        />
      </Header>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
