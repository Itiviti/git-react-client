import React from 'react';
import Rx from 'rx';
import Spinner from 'react-spinkit';
import GrepResult from './GrepResult.js';
import '../../css/prism.css';
import '../../css/components/GitGrep.css';
import {searchCodes} from '../actions/search';
import AppSettings from '../../settings.js';
import {GitForm, GitFormInput} from './GitForm.js';
import {connect} from 'react-redux';

const SEARCH_TYPE = 'Grep';

@connect(state => ({
  search: state.search[SEARCH_TYPE]
}), (dispatch) => ({
  doSearch: query => {
    const url = `${AppSettings.gitRestApi()}/repo/${query.repo}/grep/${query.branch}?q=${query.text}&path=${query.path}&delimiter=${'%0A%0A'}`;
    dispatch(searchCodes(query, url))
  }
}))
export default class GrepBox extends React.Component {
  constructor(props) {
    super(props);
    var query = this.props.location.query || {};
    this.state = {
      repo: query.repo || query.project || '^ul',
      text: query.text || query.grep || '',
      branch: query.branch || query.ref || 'HEAD',
      path: query.path || '.'
    };
  }

  render() {
    const loading = this.props.search.pending ? <Spinner spinnerName='circle' noFadeIn /> : <div/>;
    return (
      <div>
        <div style={{background: 'white', display: 'flex'}}>
          <GitForm doSearch={this.props.doSearch} location={this.props.location} type={SEARCH_TYPE}>
            <GitFormInput size="3" name="repo" desc="repos (e.g. ul)" value={this.state.repo} />
            <GitFormInput size="2" name="branch" desc="branches (e.g. HEAD)" value={this.state.branch} />
            <GitFormInput size="3" name="path" desc="path (e.g. *.java)" value={this.state.path} />
            <GitFormInput size="3" name="text" desc="search expression" value={this.state.text} />
          </GitForm>
        </div>
        <GrepResult codes={this.props.search.data} />
        {loading}
      </div>
    );
  }
}