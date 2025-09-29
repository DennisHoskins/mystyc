import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

import styles from './Table.module.css';

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={clsx('h-6 w-full !bg-purple-950', styles.stickyHeader, className)} {...props} />
));

TableHeader.displayName = 'TableHeader';
export default TableHeader;