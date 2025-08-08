import { JSX } from 'react';

import React from 'react';

import Sun from './Sun';
import Moon from './Moon';
import Rising from './Rising';
import Mercury from './Mercury';
import Mars from './Mars';
import Venus from './Venus';

const planetIcons: Record<string, () => JSX.Element> = {
  sun: () => React.createElement(Sun),
  moon: () => React.createElement(Moon),
  rising: () => React.createElement(Rising),
  mercury: () => React.createElement(Mercury),
  mars: () => React.createElement(Mars),
  venus: () => React.createElement(Venus),
};

export default planetIcons;

export function getPlanetIcon(element?: string | null): JSX.Element | undefined {
  if (!element) return undefined;
  const iconFn = planetIcons[element.toLowerCase()];
  return iconFn?.();
}
