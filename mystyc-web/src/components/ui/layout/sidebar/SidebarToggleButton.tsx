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
      className="hidden lg:flex absolute -right-2.5 top-2.5 z-10 h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
    >
      {isCollapsed ? (
        <ChevronRight className="h-4 w-4 text-gray-600" />
      ) : (
        <ChevronLeft className="h-4 w-4 text-gray-600" />
      )}
    </button>
  );
}