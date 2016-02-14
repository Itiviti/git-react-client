import Rx from 'rx';
import React from 'react';
import Spinner from "react-spinkit";
import GrepResult from './GrepResult.js';
require('../../css/components/GitGrep.css');
import { renderNodesForLayout, rxFlow, tranformDataForLayout } from './GitCommon.js';
import { browserHistory } from 'react-router'
import AppSettings from '../../settings.js';

class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    var query = this.props.location.query || {};
    this.state = {repo: query.repo || query.project || '^ul', text: query.text || query.grep || '', branch: query.branch || query.ref || 'HEAD', data: [], pending: false};
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
    var esc = Rx.Observable.fromEvent(document, 'keydown').filter(e => e.keyCode == 27);
    var rxQty = rxFlow(`${AppSettings.gitRestApi()}/repo/${params.repo}/grep/${params.branch}?q=^&path=${path}&target_line_no=${line}&delimiter=${'%0A%0A'}`, { withCredentials: false })
        .bufferWithTimeOrCount(500, 10)
        .map(elt => this.state.data.concat(elt))
        .map(orig => ({ orig, data: tranformDataForLayout(orig, this.state.layout) }))
        .doOnCompleted(() => {
          if (this.state.orig.length == 1)
              window.location = AppSettings.gitViewer().viewerForLine(this.state.orig[0]);
        })
        .takeUntil(esc)
        .finally(() => this.setState({pending: false}))
        .subscribe(this.setState.bind(this));
  }
  handleClick(e) {
    e.preventDefault();
    var subState = ({ text, branch, repo}) => ({text, branch, repo, submit: 'Search'});
    Object.assign(this.props.location.query, subState(this.state));
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
    var loading = this.state.pending ? ( <Spinner spinnerName='circle' noFadeIn /> ) : ( <div/> );
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

export default SearchBox;  

