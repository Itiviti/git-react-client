import * as React from 'react'
import { PrismCode } from 'react-prism'
import { gitViewer, IGitViewer, ISource } from '../settings'

export interface IGrepResultLine extends ISource {
  key: any, file: string, repo: string, layout?: string, branch: string, lineNo: number, line: string
}

export default class GrepResultLine extends React.Component<IGrepResultLine, {}> {
  public gitViewer: IGitViewer

  constructor(props: IGrepResultLine) {
    super(props);
    this.gitViewer = gitViewer();
  }

  public render() {
    const langs = {
        cpp: 'cpp',
        cs: 'csharp',
        fs: 'fsharp',
        gradle: 'groovy',
        ini: 'ini',
        js: 'javascript',
        kt: 'kotlin',
        md: 'markdown',
        pl: 'perl',
        py: 'python',
    };
    let lang;
    if (this.props.file) {
      const arr = this.props.file.split('.');
      const ext = arr[arr.length - 1];
      lang = `language-${langs[ext] || ext}`;
    }
    const repoHeader = ( <a href={this.gitViewer.viewerForRepo(this.props)}>{this.props.repo.replace(/\.git$/,'')}</a> );
    return (
      <div className="result">
        {this.props.layout === 'google' ? '' : repoHeader}:
        <a href={this.gitViewer.viewerForBranch(this.props)}>{this.props.branch}</a>:
        <a href={this.gitViewer.viewerForPath(this.props)}>{this.props.file}</a>:
        <a href={this.gitViewer.viewerForLine(this.props)}>{this.props.lineNo}</a>:
        <PrismCode className={lang}>{this.props.line}</PrismCode>
      </div>
    );
  }
}

