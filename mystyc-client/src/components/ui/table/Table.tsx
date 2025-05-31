// mystyc-client/src/components/ui/table/Table.tsx
'use client';

import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

const Table = forwardRef<
  HTMLTableElement,
  HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={clsx('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

export default Table;