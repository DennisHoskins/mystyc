'use client'

import { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

import FormLabel from './FormLabel';

type DateInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
};

export default function DateInput({
  id,
  name,
  label,
  error,
  className,
  value,
  ...props
}: DateInputProps) {
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Add max date if not already provided
  const inputProps = {
    ...props,
    ...(!props.max && { max: getTodayDate() })
  };

  return (
    <div className='text-left mb-4'>
      <div className="relative">
        {label && <FormLabel htmlFor={id} className='absolute left-3 top-2 text-xs' error={error}>{label}</FormLabel>}
        <input
          id={id}
          name={name}
          type="date"
          value={value}
          className={clsx(
            'block w-full h-14 rounded-md border-0 px-3 bg-[#230537] !text-white font-sans disabled:text-gray-100 disabled:opacity-60',
            label ? 'pt-6 pb-2' : 'py-3',
            className
          )}
          style={{ fontFamily: 'Google Sans Text, Google Sans, Roboto, Arial, sans-serif' }}
          {...inputProps}
        />
      </div>
    </div>
  );
}