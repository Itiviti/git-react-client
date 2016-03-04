import React from 'react';
import Rx from 'rx';
import Spinner from 'react-spinkit';
import GrepResult from './GrepResult.js';
import '../../css/prism.css';
import '../../css/components/GitGrep.css';
import {rxFlow} from './GitCommon.js';
import {browserHistory} from 'react-router'
import AppSettings from '../../settings.js';
import Cookie from 'react-cookie';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {layout: Cookie.load('layout') || 'compact'};
    this.props.settingsUpdated(this.state);
  }

  handleClick = () => {
    var layout = this.state.layout === 'google' ? 'compact' : 'google';
    this.setState({layout: layout});
    this.props.settingsUpdated({layout});
    Cookie.save('layout', layout);
  }

  render() {
    return (
      <div style={{marginLeft: 'auto'}}>Layout:
        <a onClick={this.handleClick}>{this.state.layout}</a>
      </div>
    );
  }
}

export default class GrepBox extends React.Component {
  constructor(props) {
    super(props);
    var query = this.props.location.query || {};
    this.state = {
      repo: query.repo || query.project || '^ul',
      text: query.text || query.grep || '',
      branch: query.branch || query.ref || 'HEAD',
      path: query.path || '.',
      data: [],
      pending: false,
      layout: 'compact'
    };
  }

  loadGrepFromServer = (params) => {
    this.setState({data: [], pending: true});
    var qry = new Rx.Subject();
    var esc = Rx.Observable.fromEvent(document, 'keydown')
      .filter(e => e.keyCode === 27);
    var rxQty = rxFlow(
        `${AppSettings.gitRestApi()}/repo/${params.repo}/grep/${params.branch}?q=${params.text}&path=${params.path}&delimiter=${'%0A%0A'}`,
        {withCredentials: false})
      .bufferWithTimeOrCount(500, 10)
      .map(elt => ({data: this.state.data.concat(elt)}))
      .takeUntil(esc)
      .finally(() => this.setState({pending: false}))
      .subscribe(this.setState.bind(this));
  }

  handleClick = (e) => {
    e.preventDefault();
    var subState = ({path, text, branch, repo}) => ({
      path, text, branch, repo, submit: 'Grep'
    });
    Object.assign(this.props.location.query, subState(this.state));
    browserHistory.replace(this.props.location);
    this.loadGrepFromServer(this.state);
  }

  handleAnyChange = (name, e) => {
    this.setState({[name]: e.target.value});
  }

  settingsUpdated = (settings) => {
    if (settings.layout !== this.state.layout) {
      this.setState({
        layout: settings.layout,
        data: this.state.data
      });
    }
  }

  componentDidMount() {
    var query = this.props.location.query || {};
    if (query.submit === 'Grep') {
      this.loadGrepFromServer(this.state);
    }
  }

  render() {
    var loading = this.state.pending ? <Spinner spinnerName='circle' noFadeIn /> : <div/>;
    return (
      <div>
        <div style={{background: 'white', display: 'flex'}}>
          <form className="grepForm">
            <div className="form-group">
              <div className="col-sm-3">
                <input className="form-control" type="search" placeholder="Matching repos (e.g. ul)" value={this.state.repo} onChange={this.handleAnyChange.bind(null, 'repo')} />
                <div className="help">repo (e.g. ul)</div>
              </div>
              <div className="col-sm-2">
                <input className="form-control" type="search" placeholder="Matching branches (e.g. HEAD)" value={this.state.branch} onChange={this.handleAnyChange.bind(null, 'branch')} />
                <div className="help">branch (e.g. HEAD)</div>
              </div>
              <div className="col-sm-3">
                <input className="form-control" type="search" placeholder="Matching path (e.g. *.java)" value={this.state.path} onChange={this.handleAnyChange.bind(null, 'path')} />
                <div className="help">path (e.g. *.java)</div>
              </div>
              <div className="col-sm-3">
                <input className="form-control" type="search" placeholder="Search expression" value={this.state.text} onChange={this.handleAnyChange.bind(null, 'text')} />
                <div className="help">expression</div>
              </div>
              <div className="col-sm-1">
                <button onClick={this.handleClick}>Go</button>
              </div>
            </div>
          </form>
          {loading}
          <Settings settingsUpdated={this.settingsUpdated}/>
        </div>
        <pre className="results">
          <GrepResult codes={this.state.data} layout={this.state.layout} />
        </pre>
      </div>
    );
  }
}