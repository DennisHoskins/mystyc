import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={clsx('mt-4 text-sm text-gray-500', className)}
    {...props}
  />
));

TableCaption.displayName = 'TableCaption';
export default TableCaption;