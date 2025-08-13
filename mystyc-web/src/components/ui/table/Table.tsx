import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

import styles from './Table.module.css';

const Table = forwardRef<
  HTMLTableElement,
  HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className={`relative w-full flex-1 flex flex-col bg-gray-50 rounded-md overflow-hidden ${styles.tableBody}`}>
    <table
      ref={ref}
      className={clsx('w-full bg-gray-100 overflow-hidden caption-bottom text-xs', className)}
      {...props}
    />
  </div>
));

Table.displayName = 'Table';
export default Table;