'use client'

import { InputHTMLAttributes, useRef } from 'react';
import clsx from 'clsx';

import AnimatedLabel from './AnimatedLabel';
import FormLabel from './FormLabel';

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label?: string;
  animate?: boolean;
};

export default function TextInput({
  id,
  name,
  label,
  className,
  animate = true,
  value,
  ...props
}: TextInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className='text-left mb-4'>
      <div className="relative">
        {label && animate ? <AnimatedLabel htmlFor={id} label={label} /> : <FormLabel htmlFor={id} className='absolute left-3 top-2 text-xs'>{label}</FormLabel> }
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          className={clsx(
            'block w-full h-14 rounded-md border-0 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 font-sans shadow-sm disabled:text-gray-100 disabled:opacity-60',
            label ? 'pt-6 pb-2' : 'py-3',
            'placeholder:text-transparent',
            className
          )}
          style={{ fontFamily: 'Google Sans Text, Google Sans, Roboto, Arial, sans-serif' }}
          {...props}
        />
      </div>
    </div>
  );
}