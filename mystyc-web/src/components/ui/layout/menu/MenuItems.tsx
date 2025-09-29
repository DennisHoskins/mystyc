'use client'

import { ReactNode } from 'react';

interface MenuItemsProps {
  children: ReactNode;
}

export default function MenuItems({ children }: MenuItemsProps) {
  return (
    <ul className="space-y-2 list-none">
      {children}
    </ul>
  );
}