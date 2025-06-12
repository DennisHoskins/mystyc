'use client';

import React from 'react';
import clsx from 'clsx';

interface PanelProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'info' | 'warning' | 'danger';
  className?: string;
}

export default function Panel({ 
  children, 
  variant = 'default', 
  className 
}: PanelProps) {
  const variants = {
    default: 'bg-white border-gray-200',
    primary: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200', 
    info: 'bg-purple-50 border-purple-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
  };

  return (
    <div className={clsx(
      'rounded-lg border p-6',
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
}