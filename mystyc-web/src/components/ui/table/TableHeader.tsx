'use client';

import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={clsx('[&_tr]:border-b', className)} {...props} />
));

TableHeader.displayName = 'TableHeader';
export default TableHeader;