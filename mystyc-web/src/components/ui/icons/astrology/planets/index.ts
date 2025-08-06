import { JSX } from 'react';

import React from 'react';

import Mercury from './Mercury';
import Mars from './Mars';
import Venus from './Venus';

const planetIcons: Record<string, () => JSX.Element> = {
  mercury: () => React.createElement(Mercury),
  mars: () => React.createElement(Mars),
  venus: () => React.createElement(Venus),
};

export default planetIcons;
