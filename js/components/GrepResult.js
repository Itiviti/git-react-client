import React from 'react';
import {CodeLineGoogleFormat, CodeLineCompactFormat} from './CodeLineFormat.js';

export default ({layout, ...props}) => {
  const format = {
    google: CodeLineGoogleFormat
  }[layout] || CodeLineCompactFormat;
  return React.createElement(format, props);
};