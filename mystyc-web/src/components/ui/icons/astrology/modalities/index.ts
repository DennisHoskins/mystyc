import { JSX } from 'react';

import React from 'react';

import Cardinal from './Cardinal';
import Fixed from './Fixed';
import Mutable from './Mutable';

const modalityIcons: Record<string, (className?: string) => JSX.Element> = {
  cardinal: (className) => React.createElement(Cardinal, { className }),
  fixed: (className) => React.createElement(Fixed, { className }),
  mutable: (className) => React.createElement(Mutable, { className }),
};

export default modalityIcons;

export function getModalityIcon(modality?: string | null, className?: string): JSX.Element | undefined {
  if (!modality) return undefined;
  const iconFn = modalityIcons[modality.toLowerCase()];
  return iconFn?.(className);
}