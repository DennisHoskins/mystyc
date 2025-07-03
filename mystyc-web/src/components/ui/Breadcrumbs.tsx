'use client';

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
}

export default function Breadcrumbs({ 
  items, 
  separator = '/', 
  className = '' 
}: BreadcrumbsProps) {
  const router = useTransitionRouter();

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
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = !isLast && (item.href || item.onClick);

          return (
            <li key={index} className="flex items-center overflow-hidden">
              {isClickable ? (
                <a
                  href={item.href}
                  onClick={(e) => handleClick(item, e)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {item.label}
                </a>
              ) : (
                <span className={`text-sm overflow-hidden whitespace-nowrap text-ellipsis ${isLast ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              )}
              
              {!isLast && (
                <span className="mx-2 text-sm text-gray-400" aria-hidden="true">
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