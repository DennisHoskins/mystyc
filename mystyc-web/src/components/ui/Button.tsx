'use client'

import { ButtonHTMLAttributes, ReactNode, forwardRef, Ref } from 'react';
import clsx from 'clsx';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'xs' | 'sm' | 'md';
  loading?: boolean;
  loadingContent?: ReactNode;
};

const Button = forwardRef(function Button(
  {
    children,
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingContent,
    disabled,
    ...props
  }: ButtonProps,
  ref: Ref<HTMLButtonElement>
) {
  const base =
    'rounded-md text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-80';

  const sizeStyles = {
    xs: 'px-2 py-0 !text-[10px]',
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
  };

  const variants = {
    primary: 'bg-[var(--color-alt)] text-white [text-shadow:_0_0_2px_black] hover:bg-[#ff4e2c] focus-visible:ring-indigo-600',
    secondary: 'bg-gray-200 text-[#db3b39] hover:bg-gray-300 hover:text-gray-800 focus-visible:ring-gray-400',
    ghost: 'bg-transparent text-gray-800 hover:bg-gray-100 focus-visible:ring-gray-400',
  };

  return (
    <button
      ref={ref}
      className={clsx(base, sizeStyles[size], variants[variant], className)}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? loadingContent ?? 'Loading...' : children}
    </button>
  );
});

export default Button;
