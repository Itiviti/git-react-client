import {rxFlow} from '../components/GitCommon';

const PRESSING_ESC = Rx.Observable
  .fromEvent(document, 'keydown')
  .filter(e => e.keyCode === 27);

export function searchCodes(query, url) {
  return dispatch => {
    dispatch({type: "SEARCH_CODES", time: Date.now(), query});
    rxFlow(url, {withCredentials: false})
      .bufferWithTimeOrCount(500, 10)
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