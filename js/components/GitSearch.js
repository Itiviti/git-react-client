import Rx from 'rx';
import React from 'react';
import Spinner from "react-spinkit";
import GrepResult from './GrepResult.js';
import '../../css/prism.css';
import '../../css/components/GitGrep.css';
import {rxFlow} from './GitCommon.js';
import {browserHistory} from 'react-router'
import AppSettings from '../../settings.js';
import {GitForm, GitFormInput} from './GitForm.js';
import {connect} from 'react-redux';

const SEARCH_TYPE = 'Grep';
const PRESSING_ESC = Rx.Observable
  .fromEvent(document, 'keydown')
  .filter(e => e.keyCode === 27);

function searchCodeFromServer(query) {
  return dispatch => {
    const txt = query.text;
    let match, path, line = 1;
    // TODO: redirect to MS ref src
    if (match = txt.match(/([\w\.\d]+):(\d+)/)) {
      path = `*/${match[1]}`;
      line = match[2];
    } else if (match = txt.match(/([^.]+)\.[^.]+\(/)) {
      path = `*/${match[1]}.*`;
    } else if (match = txt.match(/(\w+)/)) {
      path = `*/${match[1]}.*`;
    }
    const url = `${AppSettings.gitRestApi()}/repo/${query.repo}/grep/${query.branch}?q=^&path=${path}&target_line_no=${line}&delimiter=${'%0A%0A'}`;

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

@connect(state => ({
  search: state.search[SEARCH_TYPE]
}), (dispatch) => ({
  doSearch: query => dispatch(searchCodeFromServer(query))
}))
export default class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    var query = this.props.location.query || {};
    this.state = {
      repo: query.repo || query.project || '^ul',
      text: query.text || query.grep || '',
      branch: query.branch || query.ref || 'HEAD',
      data: [],
      pending: false
    };
  }

  handleClick = (args) => {
    const extract = ({text, branch, repo}) => ({
        text, branch, repo, submit: SEARCH_TYPE
      });
    const location = Object.assign({}, this.props.location);
    location.query = extract(args);
    browserHistory.replace(location);
    this.props.doSearch(location.query);
  }

  componentDidMount() {
    var query = this.props.location.query || {};
    if (query.submit === SEARCH_TYPE) {
      this.props.doSearch(query);
    }
  }

  render() {
    const loading = this.props.search.pending ? <Spinner spinnerName='circle' noFadeIn /> : <div/>;
    return (
      <div>
        <div style={{background: 'white', display: 'flex'}}>
          <GitForm onSubmit={this.handleClick}>
            <GitFormInput size="3" name="repo" desc="repos (e.g. ul)" value={this.state.repo} />
            <GitFormInput size="3" name="branch" desc="branches (e.g. HEAD)" value={this.state.branch} />
            <GitFormInput size="4" name="text" desc="search expression" value={this.state.text} />
          </GitForm>
        </div>
        <GrepResult codes={this.props.search.data} />
        {loading}
      </div>
    );
  }
}