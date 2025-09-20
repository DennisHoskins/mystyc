import { JSX } from 'react';

import React from 'react';

import Masculine from './Masculine';
import Feminine from './Feminine';

const polarityIcons: Record<string, (className?: string) => JSX.Element> = {
  masculine: (className) => React.createElement(Masculine, { className }),
  feminine: (className) => React.createElement(Feminine, { className }),
};

export default polarityIcons;

export function getPolarityIcon(polarity?: string | null, className?: string): JSX.Element | undefined {
  if (!polarity) return undefined;
  const iconFn = polarityIcons[polarity.toLowerCase()];
  return iconFn?.(className);
}