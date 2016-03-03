import Rx from 'rx';
import JsonPipe from 'jsonpipe';

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

export {rxFlow};