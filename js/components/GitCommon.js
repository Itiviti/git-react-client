import Rx from 'rx';
import React from 'react';
import JsonPipe from 'jsonpipe';
import GrepResult from './GrepResult.js';

function tranformDataForLayout(orig, layout) {
  return orig;
}

function renderNodesForLayout(data, layout) {
  return <GrepResult codes={data} layout={layout} />;
}

function rxFlow(url, params) {
  return Rx.Observable.create(obs => {
    var xhr = JsonPipe.flow(url, {
      success: obs.onNext.bind(obs),
      error: obs.onError.bind(obs),
      complete: obs.onCompleted.bind(obs),
      withCredentials: false
    });
    return Rx.Disposable.create(() => xhr.abort());
  });
}

export {renderNodesForLayout, rxFlow, tranformDataForLayout};