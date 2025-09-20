import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';
import TextSkeleton from './TextSkeleton';

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: 'body' | 'small' | 'xs' | 'muted';
  as?: 'p' | 'span' | 'div';
  loadingHeight?: number;
  color?: string;
}

const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = 'body', as: Component = 'p', loadingHeight, color, children, style, ...props }, ref) => {
    const variants = {
      body: 'text-sm text-gray-400',
      muted: 'text-sm text-gray-500',
      small: 'text-xs text-gray-600', 
      xs: 'text-[10px] text-gray-400', 
    };

    const getVariantLineHeight = (variant: TextProps['variant']): number => {
      const lineHeights = {
        body: 20, // text-sm line-height: ~20px
        muted: 20, // text-sm line-height: ~20px  
        small: 16, // text-xs line-height: ~16px
        xs: 16, // text-[10px] similar to text-xs: ~16px
      };
      return lineHeights[variant || 'body'];
    };

    const getDefaultLoadingHeight = (variant: TextProps['variant']): number => {
      const defaultHeights = {
        body: 5, // h-5 (20px)
        muted: 5, // h-5 (20px)  
        small: 4, // h-4 (16px)
        xs: 4, // h-4 (16px)
      };
      return defaultHeights[variant || 'body'];
    };

    const getLineHeight = (variant: TextProps['variant']): string => {
      const defaultHeights = {
        body: '1.5em',
        muted: '0.6em',
        small: '1em',
        xs: '0.3em',
      };
      return defaultHeights[variant || 'body'];
    };

    // Show skeleton if no children
    if (!children) {
      const variantLineHeight = getVariantLineHeight(variant);
      const heightInPixels = loadingHeight ? loadingHeight * 4 : getDefaultLoadingHeight(variant) * 4; // Convert Tailwind units to pixels
      const numberOfLines = Math.max(1, Math.floor(heightInPixels / variantLineHeight));
      
      return (
        <Component
          ref={ref}
          className={`opacity-10 ${loadingHeight ? '' : '!translate-y-[0.25em]'} ` + clsx(variants[variant], className)}
          style={style}
          {...props}
        >
          <TextSkeleton height={getLineHeight(variant)} lines={numberOfLines} as={Component} />
        </Component>
      );
    }

    return (
      <Component
        ref={ref}
        className={clsx(variants[variant], className) + ` ${color ? '!' + color : ''}`}
        style={style}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';
export default Text;