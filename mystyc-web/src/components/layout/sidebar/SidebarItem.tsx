'use client';

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
      className={`${styles.sidebarItem} ${computedIsActive ? styles.active : ''} ${isCollapsed ? styles.collapsed : ''} hover:bg-gray-200`}
      title={isCollapsed ? label : undefined}
    >
      <span className={`${styles.icon}`}>{icon}</span>
      <span className={`${styles.label} ${isCollapsed ? styles.collapsed : ''}`}>{label}</span>
    </a>
  );
}