import { JSX } from 'react';

import React from 'react';

import Amplification from './Amplification';
import Complementary from './Complementary';
import Harmony from './Harmony';
import Tension from './Tension';

const elementIcons: Record<string, (className?: string) => JSX.Element> = {
  amplification: (className) => React.createElement(Amplification, { className }),
  complementary: (className) => React.createElement(Complementary, { className }),
  harmony: (className) => React.createElement(Harmony, { className }),
  tension: (className) => React.createElement(Tension, { className }),
};

export default elementIcons;

export function getDynamicIcon(element?: string | null, className?: string): JSX.Element | undefined {
  if (!element) return undefined;
  const iconFn = elementIcons[element.toLowerCase()];
  return iconFn?.(className);
}