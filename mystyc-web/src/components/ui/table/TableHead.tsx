import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

const TableHead = forwardRef<
  HTMLTableCellElement,
  HTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={clsx(
      'px-2 text-left align-middle font-bold text-gray-400 [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));

TableHead.displayName = 'TableHead';
export default TableHead;