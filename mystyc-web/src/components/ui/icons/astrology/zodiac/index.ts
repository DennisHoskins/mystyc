import { JSX } from 'react';

import React from 'react';
import { SunMoon } from 'lucide-react';

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

const zodiacIcons: Record<string, (className?: string) => JSX.Element> = {
  aries: (className) => React.createElement(Aries, { className }),
  taurus: (className) => React.createElement(Taurus, { className }),
  gemini: (className) => React.createElement(Gemini, { className }),
  cancer: (className) => React.createElement(Cancer, { className }),
  leo: (className) => React.createElement(Leo, { className }),
  virgo: (className) => React.createElement(Virgo, { className }),
  libra: (className) => React.createElement(Libra, { className }),
  scorpio: (className) => React.createElement(Scorpio, { className }),
  sagittarius: (className) => React.createElement(Sagittarius, { className }),
  capricorn: (className) => React.createElement(Capricorn, { className }),
  aquarius: (className) => React.createElement(Aquarius, { className }),
  pisces: (className) => React.createElement(Pisces, { className }),
};

export default zodiacIcons;

export function getZodiacIcon(sign?: string | null, className = "w-3 h-3"): JSX.Element | undefined {
  if (!sign) return React.createElement(SunMoon, { className });
  const iconFn = zodiacIcons[sign.toLowerCase()];
  if (!iconFn) return React.createElement(SunMoon, { className });
  return iconFn?.(className);
}