import React from 'react';
import {CodeLineGoogleFormat, CodeLineCompactFormat} from './CodeLineFormat.js';

export default ({layout, ...props}) => {
  const formatted = {
    google: <CodeLineGoogleFormat {...props} />
  }[layout] || <CodeLineCompactFormat {...props} />;

  return <pre className="results">
    {formatted}
  </pre>;
};