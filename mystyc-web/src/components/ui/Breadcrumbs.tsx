'use client'

import React from 'react';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function Breadcrumbs({ 
  items, 
  separator = '/', 
  className = '',
  level = 5,
  size
}: BreadcrumbsProps) {
  const router = useTransitionRouter();

  // Default sizes based on level if no size specified
  const defaultSizes: Record<number, BreadcrumbsProps['size']> = {
    1: '2xl',
    2: 'xl', 
    3: 'lg',
    4: 'md',
    5: 'sm',
    6: 'xs',
  };

  const actualSize = size || defaultSizes[level];
  
  const sizeClasses: Record<NonNullable<BreadcrumbsProps['size']>, string> = {
    xs: 'text-xs font-semibold',
    sm: 'text-sm font-semibold', 
    md: 'text-base font-semibold',
    lg: 'text-lg font-bold',
    xl: 'text-xl font-bold',
    '2xl': 'text-2xl font-bold',
  };

  const baseSizeClass = sizeClasses[actualSize!];

  const handleClick = (item: BreadcrumbItem, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = !isLast && (item.href || item.onClick);

          return (
            <li key={index} className={`flex items-center ${isLast && 'overflow-hidden'}`}>
              {isClickable ? (
                <a
                  href={item.href}
                  onClick={(e) => handleClick(item, e)}
                  className={`${baseSizeClass} hover:underline text-gray-100`}
                >
                  {item.label}
                </a>
              ) : (
                <span className={`${baseSizeClass} truncate whitespace-nowrap  ${isLast ? 'text-gray-100' : 'text-gray-100'}`}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className={`mx-2 ${baseSizeClass} text-gray-100`} aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}