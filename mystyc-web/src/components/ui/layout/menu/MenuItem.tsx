'use client'

import { ReactNode, MouseEventHandler } from 'react';

interface MenuItemProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export default function MenuItem({ children, onClick, className }: MenuItemProps) {
  return (
    <li className={`list-none rounded-md overflow-hidden ${className}`}>
      <button
        onClick={onClick}
        className="w-full text-left px-2 lg:px-4 py-1 hover:bg-purple-100 hover:text-purple-950 transition-colors"
      >
        {children}
      </button>
    </li>
  );
}