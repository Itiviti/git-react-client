import React from 'react';
require('../../css/prism.css');
require('../prism.js');
import {PrismCode} from "react-prism";
require('../../css/components/GitGrep.css');
import AppSettings from '../../settings.js';

class GrepResult extends React.Component {
  constructor(props) {
    super(props);
    this.gitViewer = AppSettings.gitViewer();
  }
  render() {
    var langs = { cs: 'csharp', fs: 'fsharp', js: 'javascript', md: 'markdown', pl: 'perl', py: 'python' };
    var lang;
    if (this.props.file) {
      var arr = this.props.file.split('.');
      var ext = arr[arr.length - 1];
      lang = `language-${langs[ext] || ext}`;
    }
    return (
      <div>
        <a href={this.gitViewer.viewerForRepo(this.props)}>{this.props.repo.replace(/\.git$/,'')}</a>:
        <a href={this.gitViewer.viewerForBranch(this.props)}>{this.props.branch}</a>:
        <a href={this.gitViewer.viewerForPath(this.props)}>{this.props.file}</a>:
        <a href={this.gitViewer.viewerForLine(this.props)}>{this.props.line_no}</a>:
        <PrismCode className={lang}>{this.props.line}</PrismCode>
      </div>
    );
  }
}

export default GrepResult;  

