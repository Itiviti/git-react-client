import * as React from 'react'
import assign = require('object-assign')
import TextField = require('material-ui/lib/text-field')
import RaisedButton = require('material-ui/lib/raised-button')
import SelectField = require('material-ui/lib/select-field')
import MenuItem = require('material-ui/lib/menus/menu-item')
import Toggle = require('material-ui/lib/toggle')
import Dialog = require('material-ui/lib/dialog')
import {OptionsBase, OptionsBaseState} from './OptionsBase.tsx'

export default class SearchOptions extends OptionsBase<{location: any, onValidate: any, onRequestClose: any, show: boolean}, SearchOptionsState> {
  constructor(props) {
    super(props);
    var query = this.props.location.query || {};
    this.state = {
      mode: query.mode || SearchOptions.MODE_FILE,
      redirect: query.redirect? Boolean(query.redirect) : false,
    } as SearchOptionsState;
    super.initState();
  }

  public static get MODE_FILE():string { return 'file' }
  public static get MODE_STACK_FRAME():string { return 'stackframe' }

  handleAnyChange(name, e) {
    super.setState({[name]: e.target.value} as SearchOptionsState);
  }

  handleModeChanged(event, index, mode) {
    super.setState({mode} as SearchOptionsState);
  }

  handleClick(e) {
    e.preventDefault();
    this.props.onValidate(this.state)
  }

  protected getDialogTitle() {
    return 'Search parameters';
  }

  protected getPostFields() {
    return <div>
      <SelectField floatingLabelText="Search mode" value={this.state.mode} onChange={this.handleModeChanged.bind(this)}>
        <MenuItem value={SearchOptions.MODE_FILE} primaryText={SearchOptions.MODE_FILE}/>
        <MenuItem value={SearchOptions.MODE_STACK_FRAME} primaryText={SearchOptions.MODE_STACK_FRAME}/>
      </SelectField><br/>
      <Toggle label="Auto redirect" defaultToggled={this.state.redirect} onToggle={(e, open) => super.setState({redirect: open} as SearchOptionsState)}/><br />
    </div>
  }
}

export interface SearchOptionsState extends OptionsBaseState {
  mode: string;
  redirect: boolean;
}