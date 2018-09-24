import * as JsonPipe from 'jsonpipe';
import * as React from 'react';
import { Observable, Subscriber, Subscription } from 'rxjs';
import GrepResult, { IGrepResultLine } from './GrepResultLine';

export function renderNodesForLayout(data: any, layout: string | undefined) {
  let idx = 0;
  switch (layout) {
    case 'google':
      let headerIdx = 0;
      const grepNodes = data.map((repo: any) => {
        return [ (
            <h4 key={'H'+headerIdx++} className="results">{repo.replace(/\.git$/,'')}</h4>
          )].concat(data[repo].map((grep: IGrepResultLine) => (
            <GrepResult key={idx++} repo={grep.repo} branch={grep.branch} file={grep.file} lineNo={grep.lineNo} line={grep.line} layout={layout}/>
          )));
        });
      return [].concat.apply([], grepNodes);
    case 'compact':
    default:
      return data.map((grep: IGrepResultLine) => (
        <GrepResult key={idx++} repo={grep.repo} branch={grep.branch} file={grep.file} lineNo={grep.lineNo} line={grep.line} layout={layout}/>
      ));
  }
}

export function rxFlow(url: string, params: any): Observable<any> {
  return Observable.create((obs: Subscriber<any>) => {
      const flowParams = Object.assign({
        complete: obs.complete.bind(obs),
        error: obs.error.bind(obs),
        success: obs.next.bind(obs)
      }, params);
      const xhr = JsonPipe.flow(url, flowParams);
      return new Subscription(() => xhr.abort());
  });
}

