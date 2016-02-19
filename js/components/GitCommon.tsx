/// <reference path="../../typings/tsd.d.ts" />

import * as React from 'react'
import * as JsonPipe from 'jsonpipe'
import GrepResult from './GrepResult.tsx'
import {Observable, Subscription, Subscriber} from '@reactivex/rxjs'

function tranformDataForLayout(orig: Array<any>, layout: string): any {
    switch (layout) {
      case 'google':
        var data : { [key:string]:Array<{}>; } = {};
        orig.forEach(grep => {
            var curr = data[grep.repo];
            if (curr) curr.push(grep);
            else data[grep.repo] = [ grep ];
        });
        return data;
      case 'compact':
      default:
        return orig;
    }
}

function renderNodesForLayout(data: any, layout: string) {
    var idx = 0;
    switch (layout) {
      case 'google':
        var headerIdx = 0;
        var grepNodes = data.map(repo => {
          return [ (
              <h4 key={'H'+headerIdx++} className="results">{repo.replace(/\.git$/,'')}</h4>
            )].concat(data[repo].map(grep => (
              <GrepResult key={idx++} repo={grep.repo} branch={grep.branch} file={grep.file} line_no={grep.line_no} line={grep.line} layout={layout}/>
            )));
          });
        return [].concat.apply([], grepNodes);
      case 'compact':
      default:
        return data.map(grep => (
              <GrepResult key={idx++} repo={grep.repo} branch={grep.branch} file={grep.file} line_no={grep.line_no} line={grep.line} layout={layout}/>
              ));
    }
}

function rxFlow(url: string, params: any): Observable<any> {
    // TODO pass params
  return Observable.create((obs: Subscriber<any>) => {
      var xhr = JsonPipe.flow(url,
                {
                  success: obs.next.bind(obs),
                  error: obs.error.bind(obs),
                  complete: obs.complete.bind(obs),
                  withCredentials: false
                });
      return new Subscription(() => xhr.abort());
  });
}

export { renderNodesForLayout, rxFlow, tranformDataForLayout };

