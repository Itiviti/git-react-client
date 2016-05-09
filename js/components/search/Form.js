import React from 'react';
import AppSettings from '../../../settings';
import {browserHistory} from 'react-router';

export function FormInput (props) {
  return <div className={`col-sm-${props.size}`}>
    <input className="form-control"
      type="search"
      name={props.name}
      placeholder={props.desc}
      value={props.value}
      onChange={event => props.updateQuery(props.name, event.target.value)} />
    <div className="help">{props.desc}</div>
  </div>
}

function shouldStartNewSearch(query, lastSearch) {
  const queryStr = JSON.stringify(query);
  const resultStr = JSON.stringify(lastSearch.query);

  const NonEmpty = queryStr !== "{}";
  const isDiff = queryStr !== resultStr;
  const lastResutMoreThanOneMinute = isMoreThanMinutes(lastSearch.time, 1);

  return NonEmpty && (isDiff || lastResutMoreThanOneMinute);
}

function isMoreThanMinutes(time, min) {
  const now = Date.now();
  const last = time || 0;
  const diffInMinutes = (now - last) / 60000;
  return diffInMinutes > min;
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
    if (shouldStartNewSearch(query, this.props.search)
      // TODO remove the "submit" field
      && query.submit === this.props.type) {
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

  updateQuery = (key, value) => {
    const query = Object.assign({}, this.state.query, {[key]: value});
    this.setState({query});
  }

  render() {
    const children = this.props.children.map((child, i) => {
      const value = this.state.query[child.props.name] || child.props.init;
      return React.cloneElement(child, {key: i, value, updateQuery: this.updateQuery});
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