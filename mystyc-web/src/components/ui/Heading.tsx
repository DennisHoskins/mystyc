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
      xs: 'text-xs text-gray-100 font-medium',
      sm: 'text-sm text-white font-semibold', 
      md: 'text-[14px] text-gray-100 font-bold',
      lg: 'text-lg text-gray-100 font-bold',
      xl: 'text-xl text-gray-100 font-bold',
      '2xl': 'text-2xl text-gray-100 font-bold',
    };

    return createElement(
      `h${level}`,
      {
        ref,
        className: clsx(sizeClasses[actualSize!], 'truncate', className),
        ...props,
      }
    );
  }
);
Heading.displayName = 'Heading';
export default Heading;