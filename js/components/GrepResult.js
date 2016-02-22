import React from 'react';
import '../../css/prism.css';
import '../prism.js';
import {PrismCode} from 'react-prism';
import '../../css/components/GitGrep.css';
import AppSettings from '../../settings.js';

export default (props) => {
  const gitViewer = AppSettings.gitViewer();
  const repoHeader = <a href={gitViewer.viewerForRepo(props)}>
    {props.repo.replace(/\.git$/, '')}
  </a>;

  if (props.file) {
    let arr = props.file.split('.');
    let ext = arr[arr.length - 1];
    var lang = `language-${langs[ext] || ext}`;
  }

  return (
    <div>
      {props.layout === 'google' ? '' : repoHeader}:
      <a href={gitViewer.viewerForBranch(props)}>{props.branch}</a>:
      <a href={gitViewer.viewerForPath(props)}>{props.file}</a>:
      <a href={gitViewer.viewerForLine(props)}>{props.line_no}</a>:
      <PrismCode className={lang}>{props.line}</PrismCode>
    </div>
  );
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