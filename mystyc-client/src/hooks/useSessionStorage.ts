'use client';

import { useState, useEffect } from 'react';

export function useSessionStorage(key: string) {
  const [value, setValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only runs on client side
    const storedValue = sessionStorage.getItem(key);
    setValue(storedValue);
    setIsLoading(false);
  }, [key]);

  const setStoredValue = (newValue: string | null) => {
    if (typeof window !== 'undefined') {
      if (newValue === null) {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, newValue);
      }
      setValue(newValue);
    }
  };

  return {
    value,
    setValue: setStoredValue,
    isLoading,
  };
}