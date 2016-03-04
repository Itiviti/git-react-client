import React from 'react';
import TestUtils from 'react-addons-test-utils';
import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import {CodeLineGoogleFormat, CodeLineCompactFormat} from '../js/components/CodeLineFormat';
import {PrismCode} from 'react-prism';

const grepResult = [{
	branch: "HEAD",
	file: "README.txt",
	line: "HelloWorld",
	line_no: "1",
	repo: "playground",
}, {
	branch: "HEAD",
	file: "build.gradle",
	line: "apply plugin: 'java'",
	line_no: "1",
	repo: "playground",
}];

describe('Compact Format', () => {
  it('shows all code lines', () => {
  	const renderer = TestUtils.createRenderer();
  	renderer.render(<CodeLineCompactFormat codes={grepResult} />);
  	const actual = renderer.getRenderOutput();

    expect(actual)
	    .toIncludeJSX(<PrismCode className="language-txt">HelloWorld</PrismCode>)
	    .toIncludeJSX(<PrismCode className="language-groovy">apply plugin: 'java'</PrismCode>);
  });
});

describe('Google Format', () => {
  it('shows all code lines', () => {
  	const renderer = TestUtils.createRenderer();
  	renderer.render(<CodeLineGoogleFormat codes={grepResult} />);
  	const actual = renderer.getRenderOutput();

    expect(actual)
	    .toIncludeJSX(<PrismCode className="language-txt">HelloWorld</PrismCode>)
	    .toIncludeJSX(<PrismCode className="language-groovy">apply plugin: 'java'</PrismCode>);
  });

  it('group code lines by repo', () => {
		const renderer = TestUtils.createRenderer();
  	renderer.render(<CodeLineGoogleFormat codes={grepResult} />);
  	const actual = renderer.getRenderOutput();

    expect(actual.props.children.length).toEqual(1);
    const repoGroup = actual.props.children[0];
    expect(repoGroup)
	    .toIncludeJSX(<h4 className="results">playground</h4>)
	    .toIncludeJSX(<PrismCode className="language-txt">HelloWorld</PrismCode>)
	    .toIncludeJSX(<PrismCode className="language-groovy">apply plugin: 'java'</PrismCode>);
  });
});