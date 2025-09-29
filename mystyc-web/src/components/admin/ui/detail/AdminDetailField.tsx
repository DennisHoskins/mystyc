'use client'

import React, { ReactNode } from 'react';

import Text from '@/components/ui/Text';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';

interface AdminDetailFieldProps {
  label?: string | ReactNode | null;
  tag?: React.ReactNode | null;
  inline?: boolean;
  heading?: string | string[];
  subheading?: string;
  headinghref?: string | string[];
  headingicon?: React.ReactNode | React.ReactNode[] | null;
  headingtag?: React.ReactNode | null;
  icon?: React.ReactNode | null;
  type?: 'text' | 'description';
  value?: string | ReactNode | null;
  href?: string | null;
  text?: string | null;
  subtext?: string | null;
  onClick?: () => void;  
  active?: boolean;
  hasBackground?: boolean;
}

export default function AdminDetailField({ 
  label, 
  tag,
  inline = false, 
  heading, 
  subheading,
  headingicon, 
  headinghref, 
  headingtag, 
  icon, 
  type = 'text', 
  value, 
  href, 
  text,
  subtext,
  onClick, 
  active = false, 
  hasBackground = false
}: AdminDetailFieldProps) {

  const className = type == 'text' ? 'truncate min-h-2' : 'h-auto';
  const panelClass = hasBackground ? 'bg-[#230537] p-4 rounded-md' : '';

  // Helper function to safely get array item or single value
  const getArrayItem = <T,>(item: T | T[] | null | undefined, index: number): T | null => {
    if (!item) return null;
    if (Array.isArray(item)) {
      return item[index] || null;
    }
    return index === 0 ? item : null;
  };

  // Convert single values to arrays for consistent handling
  const headingArray = Array.isArray(heading) ? heading : heading ? [heading] : [];
  const headinghrefArray = Array.isArray(headinghref) ? headinghref : headinghref ? [headinghref] : [];
  const headingiconArray = Array.isArray(headingicon) ? headingicon : headingicon ? [headingicon] : [];

  return (
    <div className={`overflow-hidden ${panelClass}`}>
      {(label && !inline) &&
        <div className='flex items-center'>
          {label && typeof label === 'string' 
          ? <Text variant="xs" color='text-gray-500'>{label}</Text>
          : label
          }
          {tag}
        </div>
      }

      {heading && headingArray.length > 0 && (
        <div className='flex items-baseline flex-wrap gap-2'>
          {headingArray.map((headingItem, index) => (
            <div key={index} className='flex items-baseline'>
              <Link 
                href={getArrayItem(headinghrefArray, index) || ''} 
                className="font-light text-gray-500 flex items-center space-x-2"
              >
                {getArrayItem(headingiconArray, index)}
                <Heading level={4}>
                  {headingItem}
                </Heading>
                {index < headingArray.length - 1 && <span className='m-x-2'>-</span>}
              </Link>
              {index === headingArray.length - 1 && headingtag}
            </div>
          ))}
        </div>          
      )}

      {subheading &&
        <Text variant="xs" color='text-gray-300' className='mt-1'>
          {subheading}
        </Text>
      }

      <div className='flex flex-col'>
        {icon}

        {value &&
          <div className='flex items-center space-x-1'>
            {label && inline ? <span className='text-gray-500 text-xs'><strong>{label}</strong></span> : ''}
            {href ? (
              <Link 
                href={href} 
                onClick={onClick} 
                className={`block ${className} underline-offset-2 text-gray-100 text-base ${active && "font-bold underline"} min-h-4`}
              >
                {value || ''}
              </Link>
            ) : (
              <div className={`block ${className} text-gray-100 text-base ${active && "font-bold underline underline-offset-2"} min-h-4`}>
                {value || ''}
              </div>
            )}
          </div>
        }

        {text && (
          <Text color='text-gray-500' className={`text-xs mt-1`}>
            {label && inline ? <strong>{label}</strong> : ''}  {text}
          </Text>
        )}
        {subtext && (
          <Text color='text-gray-500' className={`text-xs mt-2`}>
            {subtext}
          </Text>
        )}
      </div>
    </div>
  );
}