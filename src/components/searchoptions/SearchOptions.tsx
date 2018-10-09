import * as React from 'react'

import { FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch } from '@material-ui/core';
import { IOptionsBaseProperties, IOptionsBaseState, OptionsBase } from './OptionsBase'

export default class SearchOptions extends OptionsBase<IOptionsBaseProperties, ISearchOptionsState> {

  constructor(props: IOptionsBaseProperties) {
    super(props);
    const query = this.props.query || {};
    this.state = {
      ...this.state,
      mode: query.mode || SearchOptions.MODE_FILE,
      redirect: Boolean(this.getQueryParameter(query, 'false', 'redirect')),
    } as ISearchOptionsState;
  }

  public static get MODE_FILE():string { return 'file' }
  public static get MODE_STACK_FRAME():string { return 'stackframe' }

  protected getDialogTitle() {
    return 'Search parameters';
  }

  protected getPostFields(inputClass: string) {
    const state = this.state as ISearchOptionsState;
    return (
    <div className={inputClass}>
      <FormControl>
          <InputLabel htmlFor="search-mode">Search Mode</InputLabel>
          <Select
            value={state.mode}
            onChange={this.handleModeChange}
            style={{ width: '200px' }}
            inputProps={{
              id: 'search-mode',
              name: 'search-mode',
            }}
          >
            <MenuItem value={SearchOptions.MODE_FILE}>{SearchOptions.MODE_FILE}</MenuItem>
            <MenuItem value={SearchOptions.MODE_STACK_FRAME}>{SearchOptions.MODE_STACK_FRAME}</MenuItem>
          </Select>
        </FormControl>
      <br/>
      <FormControlLabel
          control={
            <Switch
              checked={state.redirect}
              onChange={this.handleRedirectChange}
              value="Auto redirect"
              color="primary"
            />
          }
          label="Auto redirect"
        />
      <br />
    </div>);
  }

  private handleRedirectChange = (e:any, redirect: boolean) => super.setState({redirect} as ISearchOptionsState);
  private handleModeChange = (e: any) => super.setState({...this.state, mode: e.target.value} as ISearchOptionsState);
}

export interface ISearchOptionsState extends IOptionsBaseState {
  mode: string;
  redirect: boolean;
}