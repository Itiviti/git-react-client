import * as React from 'react'
import * as JsonPipe from 'jsonpipe'
import GrepResult from './GrepResult'
import {Observable, Subscription, Subscriber} from '@reactivex/rxjs'
import assign = require('object-assign');

export function tranformDataForLayout(orig: Array<any>, layout: string): any {
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

export function renderNodesForLayout(data: any, layout: string) {
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

export function rxFlow(url: string, params: any): Observable<any> {
  return Observable.create((obs: Subscriber<any>) => {
      var flowParams = assign({
                  success: obs.next.bind(obs),
                  error: obs.error.bind(obs),
                  complete: obs.complete.bind(obs)
                }, params);
      var xhr = JsonPipe.flow(url, flowParams);
      return new Subscription(() => xhr.abort());
  });
}

