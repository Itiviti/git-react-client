import Rx from 'rx';
import React from 'react';
import Spinner from "react-spinkit";
import GrepResult from './GrepResult.js';
import '../../css/prism.css';
import '../../css/components/GitGrep.css';
import {searchCodes} from '../actions/search';
import AppSettings from '../../settings.js';
import {GitForm, GitFormInput} from './GitForm.js';
import {connect} from 'react-redux';

const SEARCH_TYPE = 'Search';

@connect(state => ({
  search: state.search[SEARCH_TYPE]
}), (dispatch) => ({
  doSearch: query => {
    const txt = query.text;
    let match, path, line = 1;
    // TODO: redirect to MS ref src
    if (match = txt.match(/([\w\.\d]+):(\d+)/)) {
      path = `*/${match[1]}`;
      line = match[2];
    } else if (match = txt.match(/([^.]+)\.[^.]+\(/)) {
      path = `*/${match[1]}.*`;
    } else if (match = txt.match(/(\w+)/)) {
      path = `*/${match[1]}.*`;
    }
    const url = `${AppSettings.gitRestApi()}/repo/${query.repo}/grep/${query.branch}?q=^&path=${path}&target_line_no=${line}&delimiter=${'%0A%0A'}`;
    dispatch(searchCodes(query, url))
  }
}))
export default class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    var query = this.props.location.query || {};
    this.state = {
      repo: query.repo || query.project || '^ul',
      text: query.text || query.grep || '',
      branch: query.branch || query.ref || 'HEAD',
      data: [],
      pending: false
    };
  }

  render() {
    const loading = this.props.search.pending ? <Spinner spinnerName='circle' noFadeIn /> : <div/>;
    return (
      <div>
        <div style={{background: 'white', display: 'flex'}}>
          <GitForm doSearch={this.props.doSearch} location={this.props.location} type={SEARCH_TYPE}>
            <GitFormInput size="3" name="repo" desc="repos (e.g. ul)" value={this.state.repo} />
            <GitFormInput size="3" name="branch" desc="branches (e.g. HEAD)" value={this.state.branch} />
            <GitFormInput size="4" name="text" desc="search expression" value={this.state.text} />
          </GitForm>
        </div>
        <GrepResult codes={this.props.search.data} />
        {loading}
      </div>
    );
  }
}