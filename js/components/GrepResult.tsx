import * as React from 'react'
import '../../css/prism.css'
import '../prism.js'
import { PrismCode } from 'react-prism'
import '../../css/components/GitGrep.css'
import { gitViewer, gitRestApi, GitViewer } from '../../settings'

export default class GrepResult extends React.Component<{key: any, file: string, repo: string, layout: string, branch: string, line_no: number, line: string}, {}> {
  gitViewer: GitViewer
  constructor(props) {
    super(props);
    this.gitViewer = gitViewer();
  }
  render() {
    var langs = {
        cs: 'csharp',
        fs: 'fsharp',
        js: 'javascript',
        md: 'markdown',
        pl: 'perl',
        py: 'python',
        gradle: 'groovy'
    };
    var lang;
    if (this.props.file) {
      var arr = this.props.file.split('.');
      var ext = arr[arr.length - 1];
      lang = `language-${langs[ext] || ext}`;
    }
    var repoHeader = ( <a href={this.gitViewer.viewerForRepo(this.props)}>{this.props.repo.replace(/\.git$/,'')}</a> );
    return (
      <div>
        {this.props.layout == 'google' ? '' : repoHeader}:
        <a href={this.gitViewer.viewerForBranch(this.props)}>{this.props.branch}</a>:
        <a href={this.gitViewer.viewerForPath(this.props)}>{this.props.file}</a>:
        <a href={this.gitViewer.viewerForLine(this.props)}>{this.props.line_no}</a>:
        <PrismCode className={lang}>{this.props.line}</PrismCode>
      </div>
    );
  }
}

