'use client'

import { Menu as MenuIcon, X } from 'lucide-react';

interface MenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MenuButton({ isOpen, onToggle }: MenuButtonProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      className="relative z-[75] bg-transparent border-none cursor-pointer p-2 text-white"
    >
      {isOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
    </button>
  );
}