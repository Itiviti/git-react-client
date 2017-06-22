import * as React from 'react'
import assign = require('object-assign')
import TextField = require('material-ui/lib/text-field')
import RaisedButton = require('material-ui/lib/raised-button')
import SelectField = require('material-ui/lib/select-field')
import MenuItem = require('material-ui/lib/menus/menu-item')
import Toggle = require('material-ui/lib/toggle')
import Dialog = require('material-ui/lib/dialog')
import {OptionsBase, OptionsBaseState} from './OptionsBase'

export default class GrepOptions extends OptionsBase<{location: any, onValidate: any, onRequestClose: any, show: boolean}, GrepOptionsState> {
  constructor(props) {
    super(props);
    var query = this.props.location.query || {};
    this.state = {
      path: query.path || '.',
    } as GrepOptionsState;
    super.initState();
  }

  handleClick(e) {
    e.preventDefault();
    this.props.onValidate(this.state)
  }

  protected getPostFields() {
    return <div>
      <TextField type="search" floatingLabelText="Path pattern" value={this.state.path} onChange={this.handleAnyChange.bind(this, 'path')}/><br />
    </div>
  }

  protected getDialogTitle() {
    return 'Grep parameters';
  }
}

export interface GrepOptionsState extends OptionsBaseState {
  path: string
}