import React from 'react';
import {PrismCode} from 'react-prism';
import AppSettings from '../../settings.js';
import '../prism.js';

function CodeLineGoogleFormat({codes}) {
  const gitViewer = AppSettings.gitViewer();
  const groupByReop = new Map();
  codes.forEach(grep => {
    const curr = groupByReop.get(grep.repo) || [];
    curr.push(grep);
    groupByReop.set(grep.repo, curr);
  });

  let repoIdx = 0, idx = 0;
  return <div>
    {Array.from(groupByReop.keys()).map(repo => <div key={`r${repoIdx++}`}>
      <h4 className="results">
        {repo.replace(/\.git$/,'')}
      </h4>
      {groupByReop.get(repo).map(grep => <div key={idx++}>
        <a href={gitViewer.viewerForBranch(grep)}>{grep.branch}</a>:
        <a href={gitViewer.viewerForPath(grep)}>{grep.file}</a>:
        <a href={gitViewer.viewerForLine(grep)}>{grep.line_no}</a>:
        <PrismCode className={determineLang(grep.file)}>{grep.line}</PrismCode>
      </div>)}
    </div>)}
  </div>;
};

function CodeLineCompactFormat({codes}) {
  const gitViewer = AppSettings.gitViewer();

  let idx = 0;
  return <div>
    {codes.map(grep => <div key={idx++}>
      <a href={gitViewer.viewerForRepo(grep)}>{grep.repo.replace(/\.git$/, '')}</a>
      <a href={gitViewer.viewerForBranch(grep)}>{grep.branch}</a>:
      <a href={gitViewer.viewerForPath(grep)}>{grep.file}</a>:
      <a href={gitViewer.viewerForLine(grep)}>{grep.line_no}</a>:
      <PrismCode className={determineLang(grep.file)}>{grep.line}</PrismCode>
    </div>)}
  </div>;
};

export {CodeLineGoogleFormat, CodeLineCompactFormat};


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