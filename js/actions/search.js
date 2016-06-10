
import { Observable } from 'rxjs';
import JsonPipe from 'jsonpipe';

function rxFlow(url, params) {
  return Observable.create(obs => {
    var xhr = JsonPipe.flow(url, {
      success: obs.next.bind(obs),
      error: obs.error.bind(obs),
      complete: obs.complete.bind(obs),
      withCredentials: false
    });
    return () => xhr.abort();
  });
}

const PRESSING_ESC = Observable
  .fromEvent(document, 'keydown')
  .filter(e => e.keyCode === 27);

export function searchCodes(query, url) {
  return dispatch => {
    dispatch({type: "SEARCH_CODES", time: Date.now(), query});
    rxFlow(url, {withCredentials: false})
      .bufferTime(500)
      .map(more => ({type: "RECEIVE_CODES_CHUNK", query, more}))
      // TODO auto-forward (if enabled by settings)
      // .doOnCompleted(() => {
      //   if (this.state.data.length === 1) {
      //     window.location = AppSettings.gitViewer().viewerForLine(this.state.data[0]);
      //   }
      // })
      .takeUntil(PRESSING_ESC)
      .finally(() => dispatch({type: "RECEIVE_CODES_DONE", query}))
      .subscribe(dispatch);
  }
}

export const emptyQuery = {query: {}, pending: false, data: []};