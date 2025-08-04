'use client'

import { useEffect, useState } from 'react';
import clsx from 'clsx';

import FormLabel from './FormLabel';

interface AnimatedLabelProps {
  htmlFor: string;
  label: string;
}

export default function AnimatedLabel({ htmlFor, label }: AnimatedLabelProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  
  useEffect(() => {
    const input = document.getElementById(htmlFor) as HTMLInputElement;
    if (!input) return;
    
    // Check initial value
    setHasValue(Boolean(input.value));
    
    // Event handlers
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    const handleInput = () => setHasValue(Boolean(input.value));
    
    // Add listeners
    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);
    input.addEventListener('input', handleInput);
    
    // Cleanup
    return () => {
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('blur', handleBlur);
      input.removeEventListener('input', handleInput);
    };
  }, [htmlFor]);
  
  const isLabelFloated = isFocused || hasValue;
  
  return (
    <FormLabel htmlFor={htmlFor} 
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