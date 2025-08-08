import { JSX } from 'react';

import React from 'react';

import Earth from './Earth';
import Air from './Air';
import Water from './Water';
import Fire from './Fire';

const elementIcons: Record<string, () => JSX.Element> = {
  earth: () => React.createElement(Earth),
  water: () => React.createElement(Water),
  air: () => React.createElement(Air),
  fire: () => React.createElement(Fire),
};

export default elementIcons;

export function getElementIcon(element?: string | null): JSX.Element | undefined {
  if (!element) return undefined;
  const iconFn = elementIcons[element.toLowerCase()];
  return iconFn?.();
}
