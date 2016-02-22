import * as React from 'react'
import * as Spinner from 'react-spinkit'
import GrepResult from './GrepResult.tsx'
import '../../css/components/GitGrep.css'
import { renderNodesForLayout, rxFlow, tranformDataForLayout } from './GitCommon.tsx'
import { browserHistory } from 'react-router'
import { gitViewer, gitRestApi } from '../../settings.tsx'
import {Observable, Subscription} from '@reactivex/rxjs'
import assign = require('object-assign');

export default class SearchBox extends React.Component<{location: any}, {repo?: string, text?: string, branch?: string, data?: any, orig?: any, pending?: boolean, layout?: string}> {
  constructor(props) {
    super(props);
    var query = this.props.location.query || {};
    this.state = {repo: query.repo || query.project || '^ul', text: query.text || query.grep || '', branch: query.branch || query.ref || 'HEAD', data: [], orig: [], pending: false};
  }
  loadGrepFromServer(params) {
    this.setState({orig: [], data: [], pending: true});
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
    var esc = Observable.fromEvent<{keyCode: number}>(document, 'keydown').filter(e => e.keyCode == 27);
    var rxQty = rxFlow(`${gitRestApi()}/repo/${params.repo}/grep/${params.branch}?q=^&path=${path}&target_line_no=${line}&delimiter=${'%0A%0A'}`, { withCredentials: false })
        .bufferTime(500)
        .map(elt => this.state.data.concat(elt))
        .map(orig => ({ orig, data: tranformDataForLayout(orig, this.state.layout) }))
        .do(null, null, () => {
          if (this.state.orig.length == 1)
            window.location.href = gitViewer().viewerForLine(this.state.orig[0]);
        })
        .takeUntil(esc)
        .finally(() => this.setState({pending: false}))
        .subscribe(this.setState.bind(this));
  }
  handleClick(e) {
    e.preventDefault();
    var subState = (state: any) => ({text: state.text, branch: state.branch, repo: state.repo, submit: 'Search'});
    assign(this.props.location.query, subState(this.state));
    browserHistory.replace(this.props.location);
    this.loadGrepFromServer(this.state);
  }
  handleAnyChange(name, e) {
    this.setState({[name]: e.target.value});
  }
  componentDidMount() {
    var query = this.props.location.query || {};
    if (query.submit == 'Search') {
      this.loadGrepFromServer(this.state);
    }
  }
  render() {
    var loading = this.state.pending ? <Spinner spinnerName='circle' noFadeIn /> : <div/>;
    var grepNodes = renderNodesForLayout(this.state.data, this.state.layout);
    return (
      <div>
        <div style={{background: 'white', display: 'flex'}}>
          <form className="searchForm">
            <input name="repo" type="search" placeholder="Matching repos (e.g. ul)" value={this.state.repo} onChange={this.handleAnyChange.bind(this, 'repo')} />
            <input name="text" type="search" placeholder="Search expression" value={this.state.text} onChange={this.handleAnyChange.bind(this, 'text')} />
            <input name="branch" type="search" placeholder="Matching branches (e.g. HEAD)" value={this.state.branch} onChange={this.handleAnyChange.bind(this, 'branch')} />
            <button onClick={this.handleClick.bind(this)}>Search</button>
          </form>
          {loading}
        </div>
        <pre className="results">
        {grepNodes}
        </pre>
      </div>
    );
  }
}

