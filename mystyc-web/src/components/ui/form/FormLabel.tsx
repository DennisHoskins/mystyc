'use client'

import { LabelHTMLAttributes } from 'react';
import clsx from 'clsx';

type FormLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: React.ReactNode;
  error?: string | null;
  required?: boolean;
};

export default function FormLabel({
  children,
  error,
  className,
  required = false,
  ...props
}: FormLabelProps) {
  return (
    <label
      className={clsx(
        'pointer-events-none z-10',
        error ? 'text-red-500' : 'text-gray-400',
        className
      )}
      {...props}
    >
      {children}{error && " " + error.toLowerCase()}
      {required && !error && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}