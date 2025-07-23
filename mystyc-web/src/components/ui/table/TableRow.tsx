import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={clsx(
      'even:bg-gray-50 transition-colors data-[state=selected]:bg-gray-100',
      '[tbody_&]:hover:bg-gray-100',
      className
    )}
    {...props}
  />
));

TableRow.displayName = 'TableRow';
export default TableRow;