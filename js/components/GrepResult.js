import React from 'react';
import '../../css/prism.css';
import '../prism.js';
import {PrismCode} from 'react-prism';
import '../../css/components/GitGrep.css';
import AppSettings from '../../settings.js';

export default class GrepResult extends React.Component {
  constructor(props) {
    super(props);
    this.gitViewer = AppSettings.gitViewer();
  }

  render() {
    var lang;
    if (this.props.file) {
      let arr = this.props.file.split('.');
      let ext = arr[arr.length - 1];
      lang = `language-${langs[ext] || ext}`;
    }
    const repoHeader = <a href={this.gitViewer.viewerForRepo(this.props)}>
      {this.props.repo.replace(/\.git$/,'')}
    </a>;

    return (
      <div>
        {this.props.layout === 'google' ? '' : repoHeader}:
        <a href={this.gitViewer.viewerForBranch(this.props)}>{this.props.branch}</a>:
        <a href={this.gitViewer.viewerForPath(this.props)}>{this.props.file}</a>:
        <a href={this.gitViewer.viewerForLine(this.props)}>{this.props.line_no}</a>:
        <PrismCode className={lang}>{this.props.line}</PrismCode>
      </div>
    );
  }
}

const langs = {
  cs: 'csharp',
  fs: 'fsharp',
  js: 'javascript',
  md: 'markdown',
  pl: 'perl',
  py: 'python',
  gradle: 'groovy'
};