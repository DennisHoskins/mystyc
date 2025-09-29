import { JSX } from 'react';
import React from 'react';

import Archer from './Archer';
import Bull from './Bull';
import Crab from './Crab';
import Fishes from './Fishes';
import Goat from './Goat';
import Lion from './Lion';
import Maiden from './Maiden';
import Ram from './Ram';
import Scales from './Scales';
import Scorpion from './Scorpion';
import Twins from './Twins';
import WaterBearer from './WaterBearer';

const signIcons: Record<string, (className?: string) => JSX.Element> = {
  archer: (className) => React.createElement(Archer, { className }),
  bull: (className) => React.createElement(Bull, { className }),
  crab: (className) => React.createElement(Crab, { className }),
  fishes: (className) => React.createElement(Fishes, { className }),
  seagoat: (className) => React.createElement(Goat, { className }),
  lion: (className) => React.createElement(Lion, { className }),
  maiden: (className) => React.createElement(Maiden, { className }),
  ram: (className) => React.createElement(Ram, { className }),
  scorpion: (className) => React.createElement(Scorpion, { className }),
  scales: (className) => React.createElement(Scales, { className }),
  twins: (className) => React.createElement(Twins, { className }),
  waterbearer: (className) => React.createElement(WaterBearer, { className }),
};

export default signIcons;

export function getSignIcon(symbol?: string | null, className?: string): JSX.Element | undefined {
  if (!symbol) return undefined;
  const iconFn = signIcons[symbol.toLowerCase().replace(" ", "").replace("-", "")];
  return iconFn?.(className);
}