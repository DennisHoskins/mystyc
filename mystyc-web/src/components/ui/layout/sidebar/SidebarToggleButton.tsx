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
      className="hidden lg:flex absolute -right-4 top-20 -mt-[2.5px] z-10 h-6 w-6 items-center justify-center rounded-full bg-[#2e0847] border-2 border-[#25003d] hover:bg-gray-50 transition-colors"
    >
      {isCollapsed ? (
        <ChevronRight className="h-4 w-4 ml-[1.5px] text-gray-600" />
      ) : (
        <ChevronLeft className="h-4 w-4 -ml-[1.5px] text-gray-600" />
      )}
    </button>
  );
}