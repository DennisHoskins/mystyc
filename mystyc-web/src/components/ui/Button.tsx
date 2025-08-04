'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  loading?: boolean;
  loadingContent?: ReactNode;
};

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingContent,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-80';

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
  };

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus-visible:ring-gray-400',
    ghost: 'bg-transparent text-gray-800 hover:bg-gray-100 focus-visible:ring-gray-400',
  };

  return (
    <button
      className={clsx(base, sizeStyles[size], variants[variant], className)}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? loadingContent ?? 'Loading...' : children}
    </button>
  );
}
