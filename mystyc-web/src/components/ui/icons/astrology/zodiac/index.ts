import { JSX } from 'react';

import React from 'react';

import Aries from './Aries';
import Taurus from './Taurus';
import Gemini from './Gemini';
import Cancer from './Cancer';
import Leo from './Leo';
import Virgo from './Virgo';
import Libra from './Libra';
import Scorpio from './Scorpio';
import Sagittarius from './Sagittarius';
import Capricorn from './Capricorn';
import Aquarius from './Aquarius';
import Pisces from './Pisces';

const zodiacIcons: Record<string, () => JSX.Element> = {
  aries: () => React.createElement(Aries),
  taurus: () => React.createElement(Taurus),
  gemini: () => React.createElement(Gemini),
  cancer: () => React.createElement(Cancer),
  leo: () => React.createElement(Leo),
  virgo: () => React.createElement(Virgo),
  libra: () => React.createElement(Libra),
  scorpio: () => React.createElement(Scorpio),
  sagittarius: () => React.createElement(Sagittarius),
  capricorn: () => React.createElement(Capricorn),
  aquarius: () => React.createElement(Aquarius),
  pisces: () => React.createElement(Pisces),
};

export default zodiacIcons;

export function getZodiacIcon(sign?: string | null): JSX.Element | undefined {
  if (!sign) return undefined;
  const iconFn = zodiacIcons[sign.toLowerCase()];
  return iconFn?.();
}
