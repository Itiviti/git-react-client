import * as React from 'react'
import GrepResult from './GrepResult.tsx'
import '../../css/components/GitGrep.css'
import { renderNodesForLayout, rxFlow, tranformDataForLayout } from './GitCommon.tsx'
import { browserHistory } from 'react-router'
import { gitViewer, gitRestApi } from '../../settings.tsx'
import {Observable, Subscription} from '@reactivex/rxjs'
import assign = require('object-assign')
import RaisedButton = require('material-ui/lib/raised-button')
import LinearProgress = require('material-ui/lib/linear-progress')
import FontIcon = require('material-ui/lib/font-icon')
import Toolbar = require('material-ui/lib/toolbar/toolbar')
import ToolbarGroup = require('material-ui/lib/toolbar/toolbar-group')
import ToolbarSeparator = require('material-ui/lib/toolbar/toolbar-separator')
import ToolbarTitle = require('material-ui/lib/toolbar/toolbar-title')

import SearchOptions from './SearchOptions.tsx'

export default class SearchBox extends React.Component<{location: any}, {repo?: string, text?: string, branch?: string, mode?: string, redirect?: boolean, data?: any, showSearchOptions?: boolean, orig?: any, pending?: boolean, layout?: string}> {
  constructor(props) {
    super(props);
    var query = this.props.location.query || {};
    this.state = {
      repo: query.repo || query.project,
      text: query.text || query.grep,
      branch: query.branch || query.ref,
      mode: query.mode,
      redirect: query.redirect || false,
      data: [],
      showSearchOptions: false,
      pending: false
    };
  }

  loadGrepFromServer(params) {
    this.setState({
      orig: [],
      data: [],
      pending: true,
      showSearchOptions: false,
    })
    // parse text to find line_no and stuff
    var txt = params.text;
    var match;
    var path;
    var line = 1;

    var paths;
    if (params.mode == SearchOptions.MODE_FILE) {
      paths = [txt, `*/${txt}`]
    } else {
      // TODO: redirect to MS ref src
      if (match = txt.match(/([\w\.\d]+):(\d+)/)) {
        paths = [`*/${match[1]}`];
        line = match[2];
      } else if (match = txt.match(/([^.]+)\.[^.]+\(/)) {
        paths = [`*/${match[1]}.*`];
      } else if (match = txt.match(/(\w+)/)) {
        paths = [`*/${match[1]}.*`];
      }
    }
    var esc = Observable.fromEvent<{keyCode: number}>(document, 'keydown').filter(e => e.keyCode == 27);
    var paths_query = paths.map(p => `path=${p}`).join('&');
    rxFlow(`${gitRestApi()}/repo/${params.repo}/grep/${params.branch}?q=^&${paths_query}&target_line_no=${line}&delimiter=${'%0A%0A'}`, { withCredentials: false })
      .bufferTime(500)
      .map(elt => this.state.data.concat(elt))
      .map(orig => ({ orig, data: tranformDataForLayout(orig, this.state.layout) }))
      .do(null, null, () => {
        if (params.redirect === true && this.state.orig.length == 1)
          window.location.href = gitViewer().viewerForLine(this.state.orig[0]);
      })
      .takeUntil(esc)
      .finally(() => this.setState({pending: false}))
      .subscribe(this.setState.bind(this));
  }
  showSearchOptions() {
    this.setState({showSearchOptions: true});
  }
  componentDidMount() {
    var query = this.props.location.query || {};
    if (query.submit == 'Search') {
      this.loadGrepFromServer(this.state);
    } else {
      this.setState({showSearchOptions: true})
    }
  }

  renderSearchParams() {
    if (this.state.repo) {
      return <div>
        <ToolbarTitle text="Repositories"/>
        <ToolbarTitle style={{ fontWeight: "bold" }} text={this.state.repo}/>
        <ToolbarTitle text="Branch"/>
        <ToolbarTitle style={{ fontWeight: "bold" }} text={this.state.branch}/>
        <ToolbarTitle text="File pattern"/>
        <ToolbarTitle style={{ fontWeight: "bold" }} text={this.state.text}/>
      </div>
    }
    return <ToolbarTitle text="No search has been run yet"/>
  }

  onSearchOptionsValidate(options) {
    var subState = (options: any) => ({text: options.text, branch: options.branch, repo: options.repo, submit: 'Search', redirect: options.redirect});
    assign(this.props.location.query, subState(options));
    this.setState(options)
    browserHistory.replace(this.props.location);
    this.loadGrepFromServer(options);
  }

  render() {
    var loading
    if (this.state.pending)
      loading = <LinearProgress mode="indeterminate"/>
    else if (this.state.orig)
      loading = <div>Found {this.state.orig.length} result{this.state.orig.length > 1 ? 's' : ''}</div>
    else
      loading = <div/>
    var grepNodes = renderNodesForLayout(this.state.data, this.state.layout);

    return (
        <div>
          <SearchOptions location={this.props.location} onValidate={this.onSearchOptionsValidate.bind(this)} show={this.state.showSearchOptions} onRequestClose={this.setState.bind(this, { showSearchOptions: false})} />
          <Toolbar>
            <ToolbarGroup firstChild={true} float="left">
              {this.renderSearchParams()}
            </ToolbarGroup>
            <ToolbarGroup float="right">
              <ToolbarSeparator />
              <RaisedButton onClick={this.showSearchOptions.bind(this)}>
                <FontIcon className="material-icons">build</FontIcon>
              </RaisedButton>
            </ToolbarGroup>
          </Toolbar>
          <div style={{background: 'white', display: 'flex'}}>
            <br />
            {loading}
          </div>
          <pre className="results">
            {grepNodes}
          </pre>
      </div>
    );
  }
}

