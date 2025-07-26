import { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

import FormLabel from '@/components/ui/form/FormLabel';

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function TextInput({
  id,
  name,
  label,
  className,
  ...props
}: TextInputProps) {
  return (
    <div className='text-left mb-4'>
      {label && (
        <FormLabel htmlFor={id}>
          {label}
        </FormLabel>
      )}
      <input
        id={id}
        name={name}
        className={clsx(
          'block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600',
          className
        )}
        {...props}
      />
    </div>
  );
}
