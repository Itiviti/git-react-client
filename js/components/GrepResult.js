import React from 'react';
require('../../css/prism.css');
require('../prism.js');
import {PrismCode} from "react-prism";
require('../../css/components/GitGrep.css');

class GrepResult extends React.Component {
  viewerForRepo() {
    return `http://git-viewer.ullink.lan/gitweb/?p=${this.props.repo}`;
  }
  viewerForBranch() {
    return `http://git-viewer.ullink.lan/gitweb/?p=${this.props.repo};a=shortlog;h=${this.props.branch};js=1`;
  }
  viewerForPath() {
    return `http://git-viewer.ullink.lan/gitweb/?p=${this.props.repo};a=blob;f=${this.props.file};hb=${this.props.branch};js=1`;
  }
  viewerForLine() {
    return `http://git-viewer.ullink.lan/gitweb/?p=${this.props.repo};a=blob;f=${this.props.file};hb=${this.props.branch};js=1#l${this.props.line_no}`;
  }
  render() {
    var langs = { cs: 'csharp', fs: 'fsharp', js: 'javascript', md: 'markdown', pl: 'perl', py: 'python' };
    var arr = this.props.file.split('.');
    var ext = arr[arr.length - 1];
    var lang = `language-${langs[ext] || ext}`;
    return (
      <div>
        <a href={this.viewerForRepo()}>{this.props.repo}</a>:
        <a href={this.viewerForBranch()}>{this.props.branch}</a>:
        <a href={this.viewerForPath()}>{this.props.file}</a>:
        <a href={this.viewerForLine()}>{this.props.line_no}</a>:
        <PrismCode className={lang}>{this.props.line}</PrismCode>
      </div>
    );
  }
}

export default GrepResult;  

