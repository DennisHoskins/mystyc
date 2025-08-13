import { JSX } from 'react';

import React from 'react';

import Emotional from './Emotional';
import Mental from './Mental';
import Physical from './Physical';
import Spiritual from './Spiritual';

const elementIcons: Record<string, (className?: string) => JSX.Element> = {
  emotional: (className) => React.createElement(Emotional, { className }),
  mental: (className) => React.createElement(Mental, { className }),
  physical: (className) => React.createElement(Physical, { className }),
  spiritual: (className) => React.createElement(Spiritual, { className }),
};

export default elementIcons;

export function getCategoryIcon(element?: string | null, className?: string): JSX.Element | undefined {
  if (!element) return undefined;
  const iconFn = elementIcons[element.toLowerCase()];
  return iconFn?.(className);
}