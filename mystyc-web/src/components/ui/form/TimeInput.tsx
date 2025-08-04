'use client'

import { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

import FormLabel from './FormLabel';

type TimeInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
};

export default function TimeInput({
  id,
  name,
  label,
  error,
  className,
  value,
  ...props
}: TimeInputProps) {
  return (
    <div className='text-left mb-4'>
      <div className="relative">
        {label && <FormLabel htmlFor={id} className='absolute left-3 top-2 text-xs' error={error}>{label}</FormLabel>}
        <input
          id={id}
          name={name}
          type="time"
          value={value}
          className={clsx(
            'block w-full h-14 rounded-md border-0 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 font-sans shadow-sm',
            label ? 'pt-6 pb-2' : 'py-3',
            className
          )}
          style={{ fontFamily: 'Google Sans Text, Google Sans, Roboto, Arial, sans-serif' }}
          {...props}
        />
      </div>
    </div>
  );
}