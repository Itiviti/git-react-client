import * as React from 'react'
import * as Spinner from 'react-spinkit'
import GrepResult from './GrepResult.tsx'
import '../../css/components/GitGrep.css'
import { renderNodesForLayout, rxFlow, tranformDataForLayout } from './GitCommon.tsx'
import { browserHistory } from 'react-router'
import { gitRestApi } from '../../settings.tsx'
import * as Cookie from 'react-cookie'
import {Observable, Subscription} from '@reactivex/rxjs'
import assign = require('object-assign');

class Settings extends React.Component<{settingsUpdated: (settings: {layout: string}) => void }, {layout: string}> {
  constructor(props) {
    super(props);
    this.state = { layout: Cookie.load('layout') || 'compact' };
    this.props.settingsUpdated(this.state);
  }
  handleClick() {
    var layout = this.state.layout == 'google' ? 'compact' : 'google';
    this.setState({layout: layout});
    this.props.settingsUpdated({layout});
    Cookie.save('layout', layout);
  }
  render() {
    return (
      <div style={{marginLeft: 'auto'}} >Layout:
        <a onClick={this.handleClick.bind(this)}>{this.state.layout}</a>
      </div>
    );
  }
}

interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
}


export default class GrepBox extends React.Component<{location: any}, {orig?: any, data?: any, repo?: string, text?: string, branch?: string, path?: string, layout?: string, pending?: boolean}> {
  constructor(props) {
    super(props);
    var query = this.props.location.query || {};
    this.state = {orig: [], repo: query.repo || query.project || '^ul', text: query.text || query.grep || '', branch: query.branch || query.ref || 'HEAD', path: query.path || '.', data: [], pending: false, layout: 'compact'};
  }
  loadGrepFromServer(params) {
    this.setState({orig: [], data: [], pending: true});
    var esc = Observable.fromEvent<{keyCode: number}>(document, 'keydown').filter(e => e.keyCode == 27);
    var rxQty = rxFlow(`${gitRestApi()}/repo/${params.repo}/grep/${params.branch}?q=${params.text}&path=${params.path}&delimiter=${'%0A%0A'}`, { withCredentials: false })
        .bufferTime(500)
        .map(elt => this.state.orig.concat(elt))
        .map(orig => ({ orig, data: tranformDataForLayout(orig, this.state.layout) }))
        .takeUntil(esc)
        .finally(() => this.setState({pending: false}))
        .subscribe(this.setState.bind(this));
  }
  handleClick(e) {
    e.preventDefault();
    var subState = (state: any) => ({path: state.path, text: state.text, branch: state.branch, repo: state.repo, submit: 'Grep'});
    assign(this.props.location.query, subState(this.state));
    browserHistory.replace(this.props.location);
    this.loadGrepFromServer(this.state);
  }
  handleAnyChange(name, e) {
    this.setState({[name]: e.target.value});
  }
  componentDidMount() {
    var query = this.props.location.query || {};
    if (query.submit == 'Grep') {
      this.loadGrepFromServer(this.state);
    }
  }
  settingsUpdated(settings) {
    if (settings.layout != this.state.layout)
      this.setState({layout: settings.layout, data: tranformDataForLayout(this.state.orig, settings.layout)});
  }
  render() {
    var loading = this.state.pending ? <Spinner spinnerName='circle' noFadeIn /> : <div/>;
    var grepNodes = renderNodesForLayout(this.state.data, this.state.layout);
    return (
      <div>
        <div style={{background: 'white', display: 'flex'}}>
          <form className="grepForm">
            <input type="search" placeholder="Matching repos (e.g. ul)" value={this.state.repo} onChange={this.handleAnyChange.bind(this, 'repo')} />
            <input type="search" placeholder="Search expression" value={this.state.text} onChange={this.handleAnyChange.bind(this, 'text')} />
            <input type="search" placeholder="Matching branches (e.g. HEAD)" value={this.state.branch} onChange={this.handleAnyChange.bind(this, 'branch')} />
            <input type="search" placeholder="Matching path (e.g. *.java)" value={this.state.path} onChange={this.handleAnyChange.bind(this, 'path')} />
            <button onClick={this.handleClick.bind(this)}>Grep</button>
          </form>
          {loading}
          <Settings settingsUpdated={this.settingsUpdated.bind(this)}/>
        </div>
        <pre className="results">
        {grepNodes}
        </pre>
      </div>
    );
  }
}

