'use client'

import React from 'react';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';

interface ListItemButtonProps {
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function ListItemButton({
  label,
  subtitle,
  icon,
  href,
  onClick,
  className = '',
}: ListItemButtonProps) {
  const router = useTransitionRouter();
  const baseClasses =
    'block w-full p-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors';
  const combinedClasses = `${baseClasses} ${className}`;

  const content = (
    <>
      {icon && <div className="mb-2">{icon}</div>}
      <div>
        <div className="font-medium">{label}</div>
        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      </div>
    </>
  );

  if (href) {
    return (
      <button
        onClick={() => router.push(href)}
        className={combinedClasses}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <button onClick={onClick} className={combinedClasses}>
      {content}
    </button>
  );
}
