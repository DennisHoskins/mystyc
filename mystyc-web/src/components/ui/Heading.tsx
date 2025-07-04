'use client';

import { forwardRef, HTMLAttributes, createElement } from 'react';
import clsx from 'clsx';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, size, ...props }, ref) => {
    // Default sizes based on heading level if no size specified
    const defaultSizes: Record<number, HeadingProps['size']> = {
      1: '3xl',
      2: '2xl', 
      3: 'xl',
      4: 'lg',
      5: 'md',
      6: 'sm',
    };

    const actualSize = size || defaultSizes[level];
    
    const sizeClasses: Record<NonNullable<HeadingProps['size']>, string> = {
      xs: 'text-xs font-semibold',
      sm: 'text-sm font-semibold', 
      md: 'text-base font-semibold',
      lg: 'text-lg font-medium',
      xl: 'text-xl font-semibold',
      '2xl': 'text-2xl font-bold',
      '3xl': 'text-3xl font-bold tracking-tight',
    };

    return createElement(
      `h${level}`,
      {
        ref,
        className: clsx(sizeClasses[actualSize!], 'truncate text-gray-900', className),
        ...props,
      }
    );
  }
);
Heading.displayName = 'Heading';
export default Heading;