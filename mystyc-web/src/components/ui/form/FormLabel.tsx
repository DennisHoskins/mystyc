'use client'

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
        'text-gray-400 pointer-events-none z-10',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}