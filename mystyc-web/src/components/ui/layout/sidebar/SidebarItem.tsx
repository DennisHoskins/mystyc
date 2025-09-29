'use client'

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import styles from './Sidebar.module.css';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  isCollapsed?: boolean;
}

export default function SidebarItem({ 
  icon, 
  label, 
  href, 
  onClick, 
  isActive, 
  isCollapsed = false 
}: SidebarItemProps) {
  const router = useTransitionRouter();
  const pathname = usePathname();

  // Calculate active state if not explicitly provided
  const computedIsActive = isActive !== undefined ? isActive : (() => {
    if (!href) return false;
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  })();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`${styles.sidebarItem} ${computedIsActive ? 'text-white bg-purple-800' : ''} ${isCollapsed ? styles.collapsed : ''} hover:bg-purple-100 hover:text-purple-950 flex rounded-md overflow-hidden`}
      title={isCollapsed ? label : undefined}
    >
      <span className={`${styles.icon}`}>{icon}</span>
      <span className={`${styles.label} ${isCollapsed ? styles.collapsed : ''}`}>{label}</span>
    </a>
  );
}