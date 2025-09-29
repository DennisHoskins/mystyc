import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={clsx(
      'even:bg-[#1f0531] text-purple-300 transition-colors',
      '[tbody_&]:hover:bg-purple-700 [tbody_&]:hover:text-white',
      className
    )}
    {...props}
  />
));

TableRow.displayName = 'TableRow';
export default TableRow;