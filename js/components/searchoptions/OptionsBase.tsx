import * as React from 'react'
import assign = require('object-assign')
import TextField = require('material-ui/lib/text-field')
import Checkbox = require('material-ui/lib/checkbox')
import RaisedButton = require('material-ui/lib/raised-button')
import SelectField = require('material-ui/lib/select-field')
import MenuItem = require('material-ui/lib/menus/menu-item')
import Toggle = require('material-ui/lib/toggle')
import Dialog = require('material-ui/lib/dialog')
import { defaultRepoQuery } from '../../../settings'

export abstract class OptionsBase<P extends OptionsBaseProperties, S extends OptionsBaseState> extends React.Component<P, S> {
  constructor(props) {
    super(props);
  }

  public static get MODE_FILE():string { return 'file' }
  public static get MODE_STACK_FRAME():string { return 'stackframe' }

  initState() {
    var query = this.props.location.query || {};
    this.state.repo = query.repo || query.project || defaultRepoQuery();
    this.state.text = query.text || query.grep || '';
    this.state.ignore_case = query.ignore_case || false;
    this.state.branch =  query.branch || query.ref || 'HEAD';
  }

  handleAnyChange(name, e) {
    this.setState({[name]: e.target.value} as S);
  }

  handleCheckboxChange(name, e) {
    this.setState({[name]: e.target.checked} as S);
  }

  handleClick(e) {
    e.preventDefault();
    this.props.onValidate(this.state)
  }

  render() {
    return <div>
      <Dialog title={this.getDialogTitle()} open={this.props.show} onRequestClose={this.props.onRequestClose}>
        <form className="searchForm">
          <TextField type="search" floatingLabelText="Matching repos (e.g. ul)" value={this.state.repo} onChange={this.handleAnyChange.bind(this, 'repo')}/><br />
          <TextField type="search" floatingLabelText="Search expression" value={this.state.text} onChange={this.handleAnyChange.bind(this, 'text')}/><br />
          <Checkbox type="search" label="Ignore case" checked={this.state.ignore_case} onCheck={this.handleCheckboxChange.bind(this, 'ignore_case')}/><br />
          <TextField type="search" floatingLabelText="Matching branches (e.g. HEAD)" value={this.state.branch} onChange={this.handleAnyChange.bind(this, 'branch')}/><br />
          {this.getPostFields()}
          <RaisedButton type="submit" primary={true} label="Search" onClick={this.handleClick.bind(this)}/>
        </form>
      </Dialog>
    </div>
  }

  protected abstract getPostFields();
  protected abstract getDialogTitle();
}

export interface OptionsBaseProperties {
  location: any;
  onValidate: any;
  onRequestClose: any;
  show: boolean;
}

export interface OptionsBaseState {
  repo: string;
  text: string;
  branch: string;
  ignore_case: boolean;
}