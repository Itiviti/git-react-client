import React from 'react';
import AppSettings from '../../../settings';
import {browserHistory} from 'react-router';

export class FormInput extends React.Component {
  handleChange = (event) => {
    this.props.updateQuery(this.props.name, event.target.value);
  }

  render() {
    return <div className={`col-sm-${this.props.size}`}>
      <input className="form-control"
        type="search"
        name={this.props.name}
        placeholder={this.props.desc}
        value={this.props.value}
        onChange={this.handleChange} />
      <div className="help">{this.props.desc}</div>
    </div>
  }
}

export class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: props.search.query
    };
  }

  componentDidMount() {
    const query = this.props.location.query || {};
    if (query.submit === this.props.type) {
      this.setState({query});
      this.props.doSearch(query);
    }
  }

  onFormSubmit = (event) => {
    event.preventDefault();
    const query = this.state.query;
    query.submit = this.props.type

    const location = Object.assign({}, this.props.location, {query});
    browserHistory.replace(location);
    this.props.doSearch(query);
  }

  render() {
    const updateQuery = (key, value) => {
      const query = Object.assign({}, this.state.query, {[key]: value});
      this.setState({query});
    }
    const children = this.props.children.map((child, i) => {
      const ref = child.props.name;
      const value = this.state.query[ref] || child.props.init;
      return React.cloneElement(child, {key: i, ref, value, updateQuery});
    });
    return (
      <form id="query-form" className="form-group">
        {children}
        <div className="col-sm-1">
          <button onClick={this.onFormSubmit}>Go</button>
        </div>
      </form>
    );
  }
}