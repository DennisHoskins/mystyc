import { forwardRef, HTMLAttributes, createElement } from 'react';
import clsx from 'clsx';
import TextSkeleton from './TextSkeleton';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: string;
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, size, color, children, style, ...props }, ref) => {
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

    const getSkeletonHeight = (size: NonNullable<HeadingProps['size']>): string => {
      const heights = {
        xs: '0.75em',    // text-xs
        sm: '0.875em',   // text-sm
        md: '0.875em',   // text-[14px]
        lg: '1.125em',   // text-lg
        xl: '1em',       // text-xl
        '2xl': '1.25em', // text-2xl
      };
      return heights[size];
    };

    // Show skeleton if no children
    if (!children) {
      return createElement(
        `h${level}`,
        {
          ref,
          className: `opacity-10 translate-y-[0.2em] min-w-20 ` + clsx(sizeClasses[actualSize!], className),
          style: style,
          ...props,
        },
        <TextSkeleton height={getSkeletonHeight(actualSize!)} lines={1} as="span" />
      );
    }

    return createElement(
      `h${level}`,
      {
        ref,
        className: clsx(sizeClasses[actualSize!], '', className) + ` ${color ? '!' + color : ''}`,
        style: style,
        ...props,
      },
      children
    );
  }
);
Heading.displayName = 'Heading';
export default Heading;