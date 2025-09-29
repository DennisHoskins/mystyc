'use client'

import { useEffect, useState } from 'react';
import clsx from 'clsx';

import FormLabel from './FormLabel';

interface AnimatedLabelProps {
  htmlFor: string;
  label: string;
  error?: string | null;
  value?: string | number | readonly string[] | undefined;
}

export default function AnimatedLabel({ htmlFor, label, error, value }: AnimatedLabelProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const hasValue = Boolean(value);
  
  useEffect(() => {
    const input = document.getElementById(htmlFor) as HTMLInputElement;
    if (!input) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    // CHECK IMMEDIATELY
    if (document.activeElement === input) {
      setIsFocused(true);
    }

    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);

    return () => {
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('blur', handleBlur);
    };
  }, [htmlFor]);

  const isLabelFloated = isFocused || hasValue;  
  return (
    <FormLabel
      htmlFor={htmlFor} 
      error={error}
      className={clsx(
        'absolute left-3 transition-all duration-200 ease-in-out',
        isLabelFloated 
          ? 'top-2 text-xs' 
          : 'top-1/2 -translate-y-1/2 text-sm'
      )}
    >
      {label}
    </FormLabel>
  );
}