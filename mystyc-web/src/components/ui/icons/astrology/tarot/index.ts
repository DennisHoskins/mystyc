import { JSX } from 'react';

import React from 'react';

import Chariot from './Chariot';
import Death from './Death';
import Devil from './Devil';
import Emperor from './Emperor';
import Hierophant from './Hierophant';
import Hermit from './Hermit';
import Justice from './Justice';
import Lovers from './Lovers';
import Moon from './Moon';
import Star from './Star';
import Strength from './Strength';
import Temperance from './Temperance';

const tarotIcons: Record<string, (className?: string) => JSX.Element> = {
  chariot: (className) => React.createElement(Chariot, { className }),
  death: (className) => React.createElement(Death, { className }),
  devil: (className) => React.createElement(Devil, { className }),
  emperor: (className) => React.createElement(Emperor, { className }),
  hierophant: (className) => React.createElement(Hierophant, { className }),
  hermit: (className) => React.createElement(Hermit, { className }),
  justice: (className) => React.createElement(Justice, { className }),
  lovers: (className) => React.createElement(Lovers, { className }),
  moon: (className) => React.createElement(Moon, { className }),
  star: (className) => React.createElement(Star, { className }),
  strength: (className) => React.createElement(Strength, { className }),
  temperance: (className) => React.createElement(Temperance, { className }),
};

export default tarotIcons;

export function getTarotIcon(tarot?: string | null, className?: string): JSX.Element | undefined {
  if (!tarot) return undefined;
  const iconFn = tarotIcons[tarot.toLowerCase()];
  return iconFn?.(className);
}