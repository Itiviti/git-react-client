import { TextField } from '@material-ui/core';
import * as React from 'react'
import { IOptionsBaseProperties, IOptionsBaseState, OptionsBase } from './OptionsBase'

export default class GrepOptions extends OptionsBase<IOptionsProperties, IGrepOptionsState> {
  constructor(props: IOptionsProperties) {
    super(props);
    const query = this.props.query || {};
    this.state = {
      ...this.state,
      path: query.path || '.',
    } as IGrepOptionsState;
  }

  protected getPostFields(inputClass: string) {
    return <div>
      <TextField type="search" className={inputClass} fullWidth={true} label="Path pattern" value={(this.state as IGrepOptionsState).path} onChange={this.handleTextChange('path')}/><br />
    </div>
  }

  protected getDialogTitle() {
    return 'Grep parameters';
  }
}

export interface IGrepOptionsState extends IOptionsBaseState {
  path: string
}

export interface IOptionsProperties extends IOptionsBaseProperties {
  location: any,
  onValidate: any,
  onRequestClose: any,
  show: boolean
}