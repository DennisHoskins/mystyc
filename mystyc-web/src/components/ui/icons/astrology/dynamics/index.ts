import { JSX } from 'react';

import React from 'react';

import Amplification from './Amplification';
import Complementary from './Complementary';
import Harmony from './Harmony';
import Tension from './Tension';

const dynamicIcons: Record<string, (className?: string) => JSX.Element> = {
  amplification: (className) => React.createElement(Amplification, { className }),
  complementary: (className) => React.createElement(Complementary, { className }),
  harmony: (className) => React.createElement(Harmony, { className }),
  tension: (className) => React.createElement(Tension, { className }),
};

export default dynamicIcons;

export function getDynamicIcon(dynamic?: string | null, className?: string): JSX.Element | undefined {
  if (!dynamic) return undefined;
  const iconFn = dynamicIcons[dynamic.toLowerCase()];
  return iconFn?.(className);
}