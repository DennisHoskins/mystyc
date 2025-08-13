import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

import styles from './Table.module.css';

const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={clsx(styles.tableBody, '[&_tr:last-child]:border-0 bg-gray-50', className)}
    {...props}
  />
));

TableBody.displayName = 'TableBody';
export default TableBody;