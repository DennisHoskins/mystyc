import { JSX } from 'react';

import React from 'react';

import Sun from './Sun';
import Moon from './Moon';
import Rising from './Rising';
import Mercury from './Mercury';
import Mars from './Mars';
import Venus from './Venus';

const planetIcons: Record<string, (className?: string) => JSX.Element> = {
  sun: (className) => React.createElement(Sun, { className }),
  moon: (className) => React.createElement(Moon, { className }),
  rising: (className) => React.createElement(Rising, { className }),
  mercury: (className) => React.createElement(Mercury, { className }),
  mars: (className) => React.createElement(Mars, { className }),
  venus: (className) => React.createElement(Venus, { className }),
};

export default planetIcons;

export function getPlanetIcon(element?: string | null, className?: string): JSX.Element | undefined {
  if (!element) return undefined;
  const iconFn = planetIcons[element.toLowerCase()];
  return iconFn?.(className);
}