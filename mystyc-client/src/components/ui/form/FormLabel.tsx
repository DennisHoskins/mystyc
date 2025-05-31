'use client';

import { LabelHTMLAttributes } from 'react';
import clsx from 'clsx';

type FormLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: React.ReactNode;
  required?: boolean;
};

export default function FormLabel({
  children,
  className,
  required = false,
  ...props
}: FormLabelProps) {
  return (
    <label
      className={clsx(
        'block text-sm font-medium text-gray-700 mb-1',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}