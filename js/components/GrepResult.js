import React from 'react';
import {connect} from 'react-redux';
import {CodeLineGoogleFormat, CodeLineCompactFormat} from './CodeLineFormat.js';

function GrepResult({layout, ...props}) {
  const formatted = {
    google: <CodeLineGoogleFormat {...props} />
  }[layout] || <CodeLineCompactFormat {...props} />;

  return <pre className="results">
    {formatted}
  </pre>;
};

export default connect(state => ({
  layout: state.settings.layout
}), {})(GrepResult);