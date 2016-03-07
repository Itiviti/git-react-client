import Rx from 'rx';
import React from 'react';
import Spinner from "react-spinkit";
import GrepResult from './GrepResult.js';
import '../../css/prism.css';
import '../../css/components/GitGrep.css';
import {rxFlow} from './GitCommon.js';
import {browserHistory} from 'react-router'
import AppSettings from '../../settings.js';
import {GitFormInput} from './GitForm.js';

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

  loadGrepFromServer = (params) => {
    this.setState({data: [], pending: true});
    // parse text to find line_no and stuff
    var txt = params.text;
    var match;
    var path;
    var line = 1;
    // TODO: redirect to MS ref src
    if (match = txt.match(/([\w\.\d]+):(\d+)/)) {
      path = `*/${match[1]}`;
      line = match[2];
    } else if (match = txt.match(/([^.]+)\.[^.]+\(/)) {
      path = `*/${match[1]}.*`;
    } else if (match = txt.match(/(\w+)/)) {
      path = `*/${match[1]}.*`;
    }
    var esc = Rx.Observable.fromEvent(document, 'keydown')
      .filter(e => e.keyCode === 27);
    var rxQty = rxFlow(
        `${AppSettings.gitRestApi()}/repo/${params.repo}/grep/${params.branch}?q=^&path=${path}&target_line_no=${line}&delimiter=${'%0A%0A'}`,
         {withCredentials: false})
      .bufferWithTimeOrCount(500, 10)
      .map(elt => ({data: this.state.data.concat(elt)}))
      .doOnCompleted(() => {
        if (this.state.data.length === 1) {
          window.location = AppSettings.gitViewer().viewerForLine(this.state.data[0]);
        }
      })
      .takeUntil(esc)
      .finally(() => this.setState({pending: false}))
      .subscribe(this.setState.bind(this));
  }

  handleClick = (e) => {
    e.preventDefault();
    var subState = ({text, branch, repo}) => ({
        text, branch, repo, submit: 'Search'
      });
    Object.assign(this.props.location.query, subState(this.state));
    browserHistory.replace(this.props.location);
    this.loadGrepFromServer(this.state);
  }

  handleAnyChange = (name, e) => {
    this.setState({[name]: e.target.value});
  }

  componentDidMount() {
    var query = this.props.location.query || {};
    if (query.submit === 'Search') {
      this.loadGrepFromServer(this.state);
    }
  }

  render() {
    var loading = this.state.pending ? <Spinner spinnerName='circle' noFadeIn /> : <div/>;
    return (
      <div>
        <div style={{background: 'white', display: 'flex'}}>
          <form className="form-group">
            <GitFormInput size="3" name="repo" desc="repos (e.g. ul)" value={this.state.repo} onChange={this.handleAnyChange} />
            <GitFormInput size="3" name="branch" desc="branches (e.g. HEAD)" value={this.state.branch} onChange={this.handleAnyChange} />
            <GitFormInput size="4" name="text" desc="search expression" value={this.state.text} onChange={this.handleAnyChange} />
            <div className="col-sm-2">
              <button onClick={this.handleClick}>Go</button>
            </div>
          </form>
        </div>
        <pre className="results">
          <GrepResult codes={this.state.data} layout={this.state.layout} />
        </pre>
        {loading}
      </div>
    );
  }
}