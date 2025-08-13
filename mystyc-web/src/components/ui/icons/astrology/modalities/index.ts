import { JSX } from 'react';

import React from 'react';

import Cardinal from './Cardinal';
import Fixed from './Fixed';
import Mutable from './Mutable';

const elementIcons: Record<string, (className?: string) => JSX.Element> = {
  cardinal: (className) => React.createElement(Cardinal, { className }),
  fixed: (className) => React.createElement(Fixed, { className }),
  mutable: (className) => React.createElement(Mutable, { className }),
};

export default elementIcons;

export function getModalityIcon(element?: string | null, className?: string): JSX.Element | undefined {
  if (!element) return undefined;
  const iconFn = elementIcons[element.toLowerCase()];
  return iconFn?.(className);
}