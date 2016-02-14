import Rx from 'rx';
import React from 'react';
import JsonPipe from 'jsonpipe';
import GrepResult from './GrepResult.js';

function tranformDataForLayout(orig, layout) {
    switch (layout) {
      case 'google':
        var data = new Map();
        orig.forEach(grep => {
            var curr = data.get(grep.repo);
            if (curr) curr.push(grep);
            else data.set(grep.repo, [ grep ]);
        });
        return data;
      case 'compact':
      default:
        return orig;
    }
}

function renderNodesForLayout(data, layout) {
    var idx = 0;
    switch (layout) {
      case 'google':
        var headerIdx = 0;
        var grepNodes = Array.from(data.keys()).map(repo => {
          return [ (
                  <h4 key={'H'+headerIdx++} className="results">{repo}</h4>
              //<GrepResult repo={repo} />
            )].concat(data.get(repo).map(grep => (
              <GrepResult key={idx++} branch={grep.branch} file={grep.file} line_no={grep.line_no} line={grep.line}/>
            )));
          });
        return [].concat.apply([], grepNodes);
      case 'compact':
      default:
        return data.map(grep => (
              <GrepResult key={idx++} repo={grep.repo} branch={grep.branch} file={grep.file} line_no={grep.line_no} line={grep.line}/>
              ));
    }
}

function rxFlow(url, params) {
  return Rx.Observable.create(obs => {
      var xhr = JsonPipe.flow(url,
                {
                  success: obs.onNext.bind(obs),
                  error: obs.onError.bind(obs),
                  complete: obs.onCompleted.bind(obs),
                  withCredentials: false
                });
      return Rx.Disposable.create(() => xhr.abort());
  });
}

export { renderNodesForLayout, rxFlow, tranformDataForLayout };

