import React from 'react';
import {PrismCode} from 'react-prism';
import AppSettings from '../../settings.js';
import '../prism.js';
import '../../css/prism.css';
import '../../css/components/GitGrep.css';


const CodeLineGoogleFormat = (props) => {
  const gitViewer = AppSettings.gitViewer();
  return <div>
    <a href={gitViewer.viewerForBranch(props)}>{props.branch}</a>:
    <a href={gitViewer.viewerForPath(props)}>{props.file}</a>:
    <a href={gitViewer.viewerForLine(props)}>{props.line_no}</a>:
    <PrismCode className={determineLang(props.file)}>{props.line}</PrismCode>
  </div>;
};

const CodeLineCompactFormat = (props) => {
  const gitViewer = AppSettings.gitViewer();
  return <div>
    <a href={gitViewer.viewerForRepo(props)}>{props.repo.replace(/\.git$/, '')}</a>
    <a href={gitViewer.viewerForBranch(props)}>{props.branch}</a>:
    <a href={gitViewer.viewerForPath(props)}>{props.file}</a>:
    <a href={gitViewer.viewerForLine(props)}>{props.line_no}</a>:
    <PrismCode className={determineLang(props.file)}>{props.line}</PrismCode>
  </div>;
};

function determineLang(file) {
  const langs = {
    cs: 'csharp',
    fs: 'fsharp',
    js: 'javascript',
    md: 'markdown',
    pl: 'perl',
    py: 'python',
    gradle: 'groovy'
  };

  if (file) {
    let arr = file.split('.');
    let ext = arr[arr.length - 1];
    return `language-${langs[ext] || ext}`;
  }
}

export default ({layout, ...props}) => {
  const format = {
    google: CodeLineGoogleFormat
  }[layout] || CodeLineCompactFormat;
  return React.createElement(format, props);
};