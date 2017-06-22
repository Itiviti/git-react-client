import * as React from 'react'
import GrepResult from './GrepResult'
import '../../css/components/GitGrep.css'
import { renderNodesForLayout, rxFlow, tranformDataForLayout } from './GitCommon'
import { browserHistory } from 'react-router'
import { gitRestApi } from '../../settings'
import * as Cookie from 'react-cookie'
import {Observable, Subscription} from '@reactivex/rxjs'
import assign = require('object-assign');
import LinearProgress = require('material-ui/lib/linear-progress')
import RaisedButton = require('material-ui/lib/raised-button')
import FontIcon = require('material-ui/lib/font-icon')
import Toolbar = require('material-ui/lib/toolbar/toolbar')
import ToolbarGroup = require('material-ui/lib/toolbar/toolbar-group')
import ToolbarSeparator = require('material-ui/lib/toolbar/toolbar-separator')
import ToolbarTitle = require('material-ui/lib/toolbar/toolbar-title')

import GrepOptions from './searchoptions/GrepOptions'

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


export default class GrepBox extends React.Component<{location: any}, {orig?: any, data?: any, repo?: string, text?: string, branch?: string, path?: string, layout?: string, pending?: boolean, showSearchOptions?: boolean, ignore_case?: boolean}> {
  constructor(props) {
    super(props);
    var query = this.props.location.query || {};
    this.state = {
      orig: [],
      repo: query.repo || query.project,
      text: query.text || query.grep,
      ignore_case: !!query.ignore_case,
      branch: query.branch || query.ref,
      path: query.path,
      data: [],
      pending: false,
      layout: 'compact',
      showSearchOptions: false,
    };
  }
  loadGrepFromServer(params) {
    this.setState({
      orig: [],
      data: [],
      pending: true,
      showSearchOptions: false,
    });
    var esc = Observable.fromEvent<{keyCode: number}>(document, 'keydown').filter(e => e.keyCode == 27);
    rxFlow(`${gitRestApi()}/repo/${params.repo}/grep/${params.branch}?q=${params.text}&path=${params.path}&delimiter=${'%0A%0A'}${params.ignore_case?'&ignore_case=true':''}`, { withCredentials: false })
      .bufferTime(500)
      .map(elt => this.state.orig.concat(elt))
      .map(orig => ({ orig, data: tranformDataForLayout(orig, this.state.layout) }))
      .takeUntil(esc)
      .finally(() => this.setState({pending: false}))
      .subscribe(this.setState.bind(this));
  }
  onSearchOptionsValidate(options) {
    var subState = (state: any) => ({path: state.path, text: state.text, branch: state.branch, repo: state.repo, submit: 'Grep', ignore_case: state.ignore_case});
    assign(this.props.location.query, subState(options));
    this.setState(options)
    browserHistory.replace(this.props.location);
    this.loadGrepFromServer(options);
  }
  handleAnyChange(name, e) {
    this.setState({[name]: e.target.value});
  }
  componentDidMount() {
    var query = this.props.location.query || {};
    if (query.submit == 'Grep') {
      this.loadGrepFromServer(this.state);
    } else {
      this.setState({showSearchOptions: true})
    }
  }
  renderSearchParams() {
    if (this.state.repo) {
      var ignoreCaseTitle = this.state.ignore_case ? <ToolbarTitle style={{ fontWeight: "bold" }} text="(Ignore case)"/> : null;
      return <div>
        <ToolbarTitle text="Repositories"/>
        <ToolbarTitle style={{ fontWeight: "bold" }} text={this.state.repo}/>
        <ToolbarTitle text="Search expression"/>
        <ToolbarTitle style={{ fontWeight: "bold" }} text={this.state.text}/>
        {ignoreCaseTitle}
        <ToolbarTitle text="Branch"/>
        <ToolbarTitle style={{ fontWeight: "bold" }} text={this.state.branch}/>
        <ToolbarTitle text="File pattern"/>
        <ToolbarTitle style={{ fontWeight: "bold" }} text={this.state.path}/>
      </div>
    }
    return <ToolbarTitle text="No search has been run yet"/>
  }
  settingsUpdated(settings) {
    if (settings.layout != this.state.layout)
      this.setState({layout: settings.layout, data: tranformDataForLayout(this.state.orig, settings.layout)});
  }
  render() {
    var loading = this.state.pending ? <LinearProgress mode="indeterminate"/> : <div/>;
    var grepNodes = renderNodesForLayout(this.state.data, this.state.layout);
    return (
      <div>
        <GrepOptions location={this.props.location} onValidate={this.onSearchOptionsValidate.bind(this)} show={this.state.showSearchOptions} onRequestClose={this.setState.bind(this, { showSearchOptions: false})} />
        <Toolbar>
          <ToolbarGroup firstChild={true} float="left">{this.renderSearchParams()}</ToolbarGroup>
          <ToolbarGroup float="right">
            <ToolbarSeparator />
            <RaisedButton onClick={this.setState.bind(this, { showSearchOptions: true})}>
              <FontIcon className="material-icons">build</FontIcon>
            </RaisedButton>
          </ToolbarGroup>
        </Toolbar>
        {loading}
        <div style={{background: 'white', display: 'flex'}}>
          <Settings settingsUpdated={this.settingsUpdated.bind(this)}/>
        </div>
        <pre className="results">
        {grepNodes}
        </pre>
      </div>
    );
  }
}

