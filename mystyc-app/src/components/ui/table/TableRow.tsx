'use client';

import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={clsx(
      'border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-100',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export default TableRow;