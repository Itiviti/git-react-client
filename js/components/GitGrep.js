import React from 'react';
import Rx from 'rx';
import Spinner from "react-spinkit";
import GrepResult from './GrepResult.js';
require('../../css/components/GitGrep.css');
import { browserHistory } from 'react-router'
import JsonPipe from 'jsonpipe';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = { layout: 'compact' };
  }
  handleClick() {
    var layout = this.state.layout == 'google' ? 'compact' : 'google';
    this.setState({layout: layout});
    this.props.settingsUpdated({layout});
  }
  render() {
    return (
      <div style={{marginLeft: 'auto'}} >Layout: <a onClick={this.handleClick.bind(this)}>{this.state.layout}</a></div>
    );
  }
}

export default class GrepBox extends React.Component {
  constructor(props) {
    super(props);
    var query = this.props.location.query || {};
    this.state = {repo: query.repo || query.project || '^ul', text: query.text || query.grep || '', branch: query.branch || query.ref || 'HEAD', path: query.path || '.', data: [], pending: false, layout: 'compact'};
  }
  loadGrepFromServer(params) {
    this.setState({data: [], pending: true});
    var qry = new Rx.Subject();
    var rxQty = qry
        .bufferWithTimeOrCount(500, 10)
        .map(elt => this.state.data.concat(elt))
        .map(orig => ({ orig, data: this.origToData(orig) }))
        .subscribe(this.setState.bind(this), ex => {
         console.log('parsing failed', ex)
      }, () => this.setState({pending: false}));
    JsonPipe.flow(`http://git-viewer:1337/repo/${params.repo}/grep/${params.branch}?q=${params.text}&path=${params.path}&delimiter=${'%0A%0A'}`, {
            success: qry.onNext.bind(qry),
            error: qry.onError.bind(qry),
            complete: qry.onCompleted.bind(qry),
            withCredentials: false
            });
  }
  origToData(orig, layout) {
    switch (layout || this.state.layout) {
      case 'google':
        var data = new Map();
        orig.forEach(grep => {
            var curr = data.get(grep.repo);
            if (curr) curr.push(grep);
            else data.set(grep.repo, [ grep ]);
        });
        return data;
      case 'compact':
      default:
        return orig;
    }
  }
  handleClick(e) {
    e.preventDefault();
    var subState = ({ path, text, branch, repo}) => ({path, text, branch, repo, submit: 'Grep'});
    Object.assign(this.props.location.query, subState(this.state));
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
    this.setState({layout: settings.layout, data: this.origToData(this.state.orig, settings.layout)});
  }
  renderNodes() {
    var data = this.state.data;
    switch (this.state.layout) {
      case 'google':
        var grepNodes = Array.from(data.keys()).map(repo => {
          return [ (
                  <h4 className="results">{repo}</h4>
              //<GrepResult repo={repo} />
            )].concat(data.get(repo).map(grep => (
              <GrepResult branch={grep.branch} file={grep.file} line_no={grep.line_no} line={grep.line}/>
            )));
          });
        return [].concat.apply([], grepNodes);
      case 'compact':
      default:
        return data.map(grep => (
              <GrepResult repo={grep.repo} branch={grep.branch} file={grep.file} line_no={grep.line_no} line={grep.line}/>
              ));
    }
  }
  render() {
    var loading = this.state.pending ? ( <Spinner spinnerName='circle' noFadeIn /> ) : ( <div/> );
    var grepNodes = this.renderNodes();
    return (
      <div>
        <div style={{background: 'white', display: 'flex'}}>
          <form className="grepForm">
            <input type="search" placeholder="Matching repos (e.g. ul)" value={this.state.repo} onChange={this.handleAnyChange.bind(this,'repo')} />
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

