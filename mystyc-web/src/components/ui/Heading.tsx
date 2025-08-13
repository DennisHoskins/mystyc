import { forwardRef, HTMLAttributes, createElement } from 'react';
import clsx from 'clsx';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, size, ...props }, ref) => {
    // Default sizes based on heading level if no size specified
    const defaultSizes: Record<number, HeadingProps['size']> = {
      1: '2xl',
      2: 'xl', 
      3: 'lg',
      4: 'md',
      5: 'sm',
      6: 'xs',
    };

    const actualSize = size || defaultSizes[level];
    
    const sizeClasses: Record<NonNullable<HeadingProps['size']>, string> = {
      xs: 'text-xs',
      sm: 'text-sm font-bold', 
      md: 'text-[14px] font-bold',
      lg: 'text-lg font-bold',
      xl: 'text-xl font-bold',
      '2xl': 'text-2xl font-bold',
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