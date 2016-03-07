import React from 'react';
import AppSettings from '../../settings.js';

export class GitFormInput extends React.Component {
  handleChange = (evt) => {
    this.props.onChange(this.props.name, evt);
  }

  render() {
    return (
      <div className={`col-sm-${this.props.size}`}>
        <input className="form-control"
          type="search"
          name={this.props.name}
          placeholder={this.props.desc}
          value={this.props.value}
          onChange={this.handleChange} />
        <div className="help">{this.props.desc}</div>
      </div>
    );
  }
}