'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarToggleButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function SidebarToggleButton({ 
  isCollapsed, 
  onToggle 
}: SidebarToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="hidden lg:flex absolute -right-4 top-20 -mt-[2.5px] z-50 h-6 w-6 items-center justify-center rounded-full bg-[var(--color-main-1)] border-2 border-[var(--color-border)] hover:bg-gray-50 transition-colors"
    >
      {isCollapsed ? (
        <ChevronRight className="h-4 w-4 ml-[1.5px] text-gray-600 font-bold" strokeWidth={4} />
      ) : (
        <ChevronLeft className="h-4 w-4 -ml-[1.5px] text-gray-600 font-bold" strokeWidth={4} />
      )}
    </button>
  );
}