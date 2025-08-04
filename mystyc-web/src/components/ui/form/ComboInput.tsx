import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react'
import clsx from 'clsx'
import AnimatedLabel from './AnimatedLabel'

interface ComboInputProps<T> {
  id: string
  name: string
  label?: string
  value: T | null
  onChange: (value: T | null) => void
  displayValue: (item: T | null) => string
  onInputChange: (value: string) => void
  suggestions: T[]
  getSuggestionKey: (item: T, index: number) => string | number
  renderSuggestion: (item: T) => React.ReactNode
  placeholder?: string
  disabled?: boolean
  className?: string
  footer?: React.ReactNode
}

export default function ComboInput<T>({
  id,
  name,
  label,
  value,
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
}: ComboInputProps<T>) {
  return (
    <div className='text-left mb-4'>
      <Combobox value={value} onChange={onChange}>
        <div className="relative">
          {label && <AnimatedLabel htmlFor={id} label={label} />}
          
          <ComboboxInput
            id={id}
            name={name}
            className={clsx(
              'block w-full h-14 rounded-md border-0 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 font-sans shadow-sm placeholder:text-transparent',
              label ? 'pt-6 pb-2' : 'py-3',
              className
            )}
            style={{ fontFamily: 'Google Sans Text, Google Sans, Roboto, Arial, sans-serif' }}
            displayValue={displayValue}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={placeholder}
            disabled={disabled}
          />

          <ComboboxOptions className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none">
            {suggestions.map((suggestion, index) => (
              <ComboboxOption
                key={getSuggestionKey(suggestion, index)}
                value={suggestion}
                className={({ active }) =>
                  clsx(
                    'relative cursor-pointer select-none px-3 py-2 text-left',
                    active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
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
  )
}