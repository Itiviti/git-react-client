import React from 'react';
import AppSettings from '../../settings.js';

export const GitFormInput = (props) => (
  <div className={`col-sm-${props.size}`}>
    <input className="form-control"
      type="search"
      name={props.name}
      placeholder={props.desc}
      value={props.value}
      onChange={evt => props.onChange(props.name, evt.target.value)} />
    <div className="help">{props.desc}</div>
  </div>
);

export class GitForm extends React.Component {
  onFormSubmit = (evt) => {
    evt.preventDefault();
    this.props.onSubmit(this.state);
  }

  onValueChange = (name, value) => {
    this.setState({[name]: value});
  }

  render() {
    const attachedChild = this.props.children.map((child, i) => {
      return React.cloneElement(child, {key: i, onChange: this.onValueChange});
    });
    return (
      <form className="form-group">
        {attachedChild}
        <div className="col-sm-1">
          <button onClick={this.onFormSubmit}>Go</button>
        </div>
      </form>
    );
  }
}