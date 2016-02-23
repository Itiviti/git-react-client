import * as React from 'react'
import assign = require('object-assign')
import TextField = require('material-ui/lib/text-field')
import RaisedButton = require('material-ui/lib/raised-button')
import SelectField = require('material-ui/lib/select-field')
import MenuItem = require('material-ui/lib/menus/menu-item')
import Toggle = require('material-ui/lib/toggle')
import Dialog = require('material-ui/lib/dialog')

export default class SearchOptions extends React.Component<{location: any, onValidate: any, onRequestClose: any, show: boolean}, {repo?: string, text?: string, branch?: string, mode?: string, redirect?: boolean}> {
  constructor(props) {
    super(props);
    var query = this.props.location.query || {};
    this.state = {
      repo: query.repo || query.project || '^ul',
      text: query.text || query.grep || '',
      branch: query.branch || query.ref || 'HEAD',
      mode: query.mode || SearchOptions.MODE_FILE,
      redirect: query.redirect? Boolean(query.redirect) : false,
    };
  }

  public static get MODE_FILE():string { return 'file' }
  public static get MODE_STACK_FRAME():string { return 'stackframe' }

  handleAnyChange(name, e) {
    this.setState({[name]: e.target.value});
  }

  handleModeChanged(event, index, mode) {
    this.setState({mode});
  }

  handleClick(e) {
    e.preventDefault();
    this.props.onValidate(this.state)
  }

  render() {
    return <div>
      <Dialog title="Search parameters" open={this.props.show} onRequestClose={this.props.onRequestClose}>
        <form className="searchForm">
          <TextField type="search" floatingLabelText="Matching repos (e.g. ul)" value={this.state.repo} onChange={this.handleAnyChange.bind(this, 'repo')}/><br />
          <TextField type="search" floatingLabelText="Search expression" value={this.state.text} onChange={this.handleAnyChange.bind(this, 'text')}/><br />
          <TextField type="search" floatingLabelText="Matching branches (e.g. HEAD)" value={this.state.branch} onChange={this.handleAnyChange.bind(this, 'branch')}/><br />
          <SelectField floatingLabelText="Search mode" value={this.state.mode} onChange={this.handleModeChanged.bind(this)}>
            <MenuItem value={SearchOptions.MODE_FILE} primaryText={SearchOptions.MODE_FILE}/>
            <MenuItem value={SearchOptions.MODE_STACK_FRAME} primaryText={SearchOptions.MODE_STACK_FRAME}/>
          </SelectField><br/>
          <Toggle label="Auto redirect" defaultToggled={this.state.redirect} onToggle={(e, open) => this.setState({redirect: open})}/><br />
          <RaisedButton type="submit" primary={true} label="Search" onClick={this.handleClick.bind(this)}/>
        </form>
      </Dialog>
    </div>
  }
}