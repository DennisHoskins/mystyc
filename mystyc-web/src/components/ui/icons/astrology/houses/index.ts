import { JSX } from 'react';
import React from 'react';

import Career from './Career';
import Communication from './Communication';
import Community from './Community';
import Creativity from './Creativity';
import Exploration from './Exploration';
import Health from './Health';
import Home from './Home';
import Partnerships from './Partnerships';
import Reflection from './Reflection';
import Self from './Self';
import Transformation from './Transformation';
import Values from './Values';

const houseIcons: Record<string, (className?: string) => JSX.Element> = {
  career: (className) => React.createElement(Career, { className }),
  communication: (className) => React.createElement(Communication, { className }),
  community: (className) => React.createElement(Community, { className }),
  creativity: (className) => React.createElement(Creativity, { className }),
  exploration: (className) => React.createElement(Exploration, { className }),
  health: (className) => React.createElement(Health, { className }),
  home: (className) => React.createElement(Home, { className }),
  partnerships: (className) => React.createElement(Partnerships, { className }),
  reflection: (className) => React.createElement(Reflection, { className }),
  self: (className) => React.createElement(Self, { className }),
  transformation: (className) => React.createElement(Transformation, { className }),
  values: (className) => React.createElement(Values, { className }),
};

export default houseIcons;

export function getHouseIcon(house?: string | null, className?: string): JSX.Element | undefined {
  if (!house) return undefined;
  const iconFn = houseIcons[house.toLowerCase()];
  return iconFn?.(className);
}
