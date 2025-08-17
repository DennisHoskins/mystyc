import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

import styles from './Table.module.css';

const Table = forwardRef<
  HTMLTableElement,
  HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className={clsx('relative w-full flex-1 flex flex-col rounded-sm overflow-hidden border border-purple-950 bg-[#230537] shadow-inner', styles.tableWrapper)}>
    <table
      ref={ref}
      className={clsx('w-full caption-bottom text-xs', className)}
      {...props}
    />
  </div>
));

Table.displayName = 'Table';
export default Table;