'use client'

import { useState } from 'react';

import MystycMenuButton from '@/components/mystyc/ui/MystycMenuButton';
import Menu from '@/components/ui/layout/menu/Menu';

export default function MystycHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
        <MystycMenuButton 
          menuOpen={menuOpen} 
          setMenuOpen={setMenuOpen} 
        />
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
