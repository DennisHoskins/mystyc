import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

const TableHead = forwardRef<
  HTMLTableCellElement,
  HTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={clsx(
      'h-10 px-2 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));

TableHead.displayName = 'TableHead';
export default TableHead;