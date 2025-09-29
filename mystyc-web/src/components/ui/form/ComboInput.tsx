'use client'

import styles from '../layout/scroll/ScrollWrapper.module.css';

import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption
} from '@headlessui/react';
import clsx from 'clsx';
import { forwardRef, Ref } from 'react';

import AnimatedLabel from './AnimatedLabel';

interface ComboInputProps<T> {
  id: string;
  name: string;
  label?: string;
  error?: string | null;
  value: T | null;
  autocomplete?: '' | 'on' | 'off';
  onChange: (value: T | null) => void;
  displayValue: (item: T | null) => string;
  onInputChange: (value: string) => void;
  suggestions: T[];
  getSuggestionKey: (item: T, index: number) => string | number;
  renderSuggestion: (item: T) => React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  footer?: React.ReactNode;
}

const ComboInput = forwardRef<HTMLInputElement, ComboInputProps<any>>(function ComboInput<T>(
  {
    id,
    name,
    label,
    error,
    value,
    autocomplete = 'on',
    onChange,
    displayValue,
    onInputChange,
    suggestions,
    getSuggestionKey,
    renderSuggestion,
    placeholder = '',
    disabled = false,
    className,
    footer
  }: ComboInputProps<T>,
  ref: Ref<HTMLInputElement>
) {

  return (
    <div className='text-left mb-4'>
      <Combobox value={value} onChange={onChange}>
        <div className="relative">
          {label && (
            <AnimatedLabel
              htmlFor={id}
              label={label}
              value={value ? value.toString() : " "}
              error={error}
            />
          )}

          <ComboboxInput
            ref={ref}
            id={id}
            name={name}
            autoComplete={autocomplete}
            className={clsx(
              'block w-full h-14 rounded-md border-0 px-3 bg-[#230537] !text-white font-sans disabled:text-gray-100 disabled:opacity-60',
              label ? 'pt-6 pb-2' : 'py-3',
              className
            )}
            style={{ fontFamily: 'Google Sans Text, Google Sans, Roboto, Arial, sans-serif' }}
            displayValue={displayValue}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={placeholder}
            disabled={disabled}
          />

          <ComboboxOptions 
            className={`absolute z-10 w-full bg-[#230537] border border-[var(--color-border)] rounded-md shadow-lg max-h-56 overflow-auto focus:outline-none ${styles.scroller}`}
          >
            {suggestions.map((suggestion, index) => (
              <ComboboxOption
                key={getSuggestionKey(suggestion, index)}
                value={suggestion}
                className={({ active }) =>
                  clsx(
                    'relative cursor-pointer select-none px-3 py-2 text-left',
                    active ? 'bg-[var(--color-main-1)] text-white' : 'text-gray-500'
                  )
                }
              >
                {renderSuggestion(suggestion)}
              </ComboboxOption>
            ))}

            {footer && suggestions.length > 0 && footer}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  );
});

export default ComboInput;
