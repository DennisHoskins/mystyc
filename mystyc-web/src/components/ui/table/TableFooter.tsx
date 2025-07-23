import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={clsx(
      'border-t bg-gray-50/50 font-medium [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  />
));

TableFooter.displayName = 'TableFooter';
export default TableFooter;