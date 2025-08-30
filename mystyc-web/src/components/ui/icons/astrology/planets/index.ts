import { JSX } from 'react';

import React from 'react';

import Jupiter from './Jupiter';
import Mars from './Mars';
import Mercury from './Mercury';
import Moon from './Moon';
import Neptune from './Neptune';
import Pluto from './Pluto';
import Rising from './Rising';
import Saturn from './Saturn';
import Sun from './Sun';
import Uranus from './Uranus';
import Venus from './Venus';


const planetIcons: Record<string, (className?: string) => JSX.Element> = {
  jupiter: (className) => React.createElement(Jupiter, { className }),
  mars: (className) => React.createElement(Mars, { className }),
  mercury: (className) => React.createElement(Mercury, { className }),
  moon: (className) => React.createElement(Moon, { className }),
  neptune: (className) => React.createElement(Neptune, { className }),
  pluto: (className) => React.createElement(Pluto, { className }),
  rising: (className) => React.createElement(Rising, { className }),
  saturn: (className) => React.createElement(Saturn, { className }),
  sun: (className) => React.createElement(Sun, { className }),
  uranus: (className) => React.createElement(Uranus, { className }),
  venus: (className) => React.createElement(Venus, { className }),
};

export default planetIcons;

export function getPlanetIcon(planet?: string | null, className?: string): JSX.Element | undefined {
  if (!planet) return undefined;
  const iconFn = planetIcons[planet.toLowerCase()];
  return iconFn?.(className);
}