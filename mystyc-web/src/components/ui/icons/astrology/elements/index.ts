import { JSX } from 'react';

import React from 'react';

import Earth from './Earth';
import Air from './Air';
import Water from './Water';
import Fire from './Fire';

const elementIcons: Record<string, (className?: string) => JSX.Element> = {
  earth: (className) => React.createElement(Earth, { className }),
  water: (className) => React.createElement(Water, { className }),
  air: (className) => React.createElement(Air, { className }),
  fire: (className) => React.createElement(Fire, { className }),
};

export default elementIcons;

export function getElementIcon(element?: string | null, className?: string): JSX.Element | undefined {
  if (!element) return undefined;
  const iconFn = elementIcons[element.toLowerCase()];
  return iconFn?.(className);
}