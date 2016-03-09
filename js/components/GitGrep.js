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
import {GitForm, GitFormInput} from './GitForm.js';

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
    const qry = new Rx.Subject();
    const esc = Rx.Observable.fromEvent(document, 'keydown')
      .filter(e => e.keyCode === 27);
    const url = `${AppSettings.gitRestApi()}/repo/${params.repo}/grep/${params.branch}?q=${params.text}&path=${params.path}&delimiter=${'%0A%0A'}`;
    rxFlow(url, {withCredentials: false})
      .bufferWithTimeOrCount(500, 10)
      .map(elt => ({data: this.state.data.concat(elt)}))
      .takeUntil(esc)
      .finally(() => this.setState({pending: false}))
      .subscribe(this.setState.bind(this));
  }

  handleClick = (args) => {
    const extract = ({path, text, branch, repo}) => ({
      path, text, branch, repo, submit: 'Grep'
    });
    const location = Object.assign({}, this.props.location);
    location.query = extract(args);
    browserHistory.replace(location);
    this.loadGrepFromServer(location.query);
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
    const loading = this.state.pending ? <Spinner spinnerName='circle' noFadeIn /> : <div/>;
    return (
      <div>
        <div style={{background: 'white', display: 'flex'}}>
          <GitForm onSubmit={this.handleClick}>
            <GitFormInput size="3" name="repo" desc="repos (e.g. ul)" value={this.state.repo} />
            <GitFormInput size="2" name="branch" desc="branches (e.g. HEAD)" value={this.state.branch} />
            <GitFormInput size="3" name="path" desc="path (e.g. *.java)" value={this.state.path} />
            <GitFormInput size="3" name="text" desc="search expression" value={this.state.text} />
          </GitForm>
          <Settings settingsUpdated={this.settingsUpdated}/>
        </div>
        <GrepResult codes={this.state.data} layout={this.state.layout} />
        {loading}
      </div>
    );
  }
}