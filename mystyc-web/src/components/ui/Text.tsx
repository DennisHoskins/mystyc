import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: 'body' | 'small' | 'xs' | 'muted';
  as?: 'p' | 'span' | 'div';
}

const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = 'body', as: Component = 'p', ...props }, ref) => {
    const variants = {
      body: 'text-base text-gray-400',
      muted: 'text-sm text-gray-500',
      small: 'text-xs text-gray-600', 
      xs: 'text-[10px] text-gray-400', 
    };

    return (
      <Component
        ref={ref}
        className={clsx(variants[variant], className)}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';
export default Text;