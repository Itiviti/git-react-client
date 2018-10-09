import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField } from '@material-ui/core'
import { ParsedUrlQuery } from 'querystring';
import * as React from 'react'
import { ReactNode } from 'react';
import { defaultRepoQuery } from '../../settings';

export abstract class OptionsBase<P extends IOptionsBaseProperties, S extends IOptionsBaseState> extends React.Component<IOptionsBaseProperties, IOptionsBaseState> {

  public static get MODE_FILE():string { return 'file' }
  public static get MODE_STACK_FRAME():string { return 'stackframe' }
  constructor(props: IOptionsBaseProperties) {
    super(props);
    const query = this.props.query;
    this.state = {
      branch: this.getQueryParameter(query, 'HEAD', 'branch', 'ref'),
      ignoreCase: query.ignoreCase && query.ignoreCase === "true" ? true : false,
      repo: this.getQueryParameter(query, defaultRepoQuery(), 'repo', 'project'),
      text: this.getQueryParameter(query, '', 'text', 'grep')
    }
  }

  public render() {
    return <div>
      <Dialog open={this.props.show} onClose={this.props.onClose}>
        <form>
          <DialogTitle>{this.getDialogTitle()}</DialogTitle>
          <DialogContent>
            <TextField type="search" className={this.props.inputClass} fullWidth={true} label="Matching repos (e.g. ^ul)" value={this.state.repo} onChange={this.handleTextChange('repo')}/>
            <TextField type="search" className={this.props.inputClass} fullWidth={true} label="Search expression" value={this.state.text} onChange={this.handleTextChange('text')}/>
            <FormControlLabel className={this.props.inputClass} control={<Checkbox checked={this.state.ignoreCase} onChange={this.handleIgnoreCase} color="default" />} label="Ignore case" />
            <TextField type="search" className={this.props.inputClass} fullWidth={true} label="Matching branches (e.g. HEAD)" value={this.state.branch} onChange={this.handleTextChange('branch')}/>
            {this.getPostFields(this.props.inputClass)}
          </DialogContent>
          <DialogActions style={{ marginBottom: '20px', marginRight: '20px' }}>
            <Button type="submit" color='primary' variant='contained' onClick={this.handleClick}>Search</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  }

  protected abstract getPostFields(inputClass: string): ReactNode;
  protected abstract getDialogTitle(): string;

  protected handleTextChange(target: string): (e: React.ChangeEvent<HTMLInputElement>) => void {
    return (e) => this.setState({...this.state, [target]: e.target.value});
  }

  protected handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    this.props.onValidate(this.state);
  }

  protected getQueryParameter(query: ParsedUrlQuery, defaultValue: string, ...keys: string[]): string {
    for (const key of keys) {
      const value = query[key];
      if (value && typeof value === 'string') {
        return value;
      }
    }
    return defaultValue;
  }

  private handleIgnoreCase = (e: object, checked: boolean) => {
    this.setState({...this.state, ignoreCase: checked});
  }
}

export interface IOptionsBaseProperties {
  query: ParsedUrlQuery;
  onValidate: any;
  onClose: any;
  show: boolean;
  inputClass: string;
}

export interface IOptionsBaseState {
  repo: string;
  text: string;
  branch: string;
  ignoreCase: boolean;
}