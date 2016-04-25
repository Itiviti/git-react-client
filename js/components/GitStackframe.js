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

const SEARCH_TYPE = 'stackframe';

@connect(state => ({
  search: state.search[SEARCH_TYPE] || {query: {}, pending: false, data: []}
}), (dispatch) => ({
  doSearch: query => {
    let match = query.text.match(/([\w\.\d]+):(\d+)/);
    let path = `*/${match[1]}`, line = match[2];
    const url = `${AppSettings.gitRestApi()}/repo/${query.repo}/grep/${query.branch}?q=^&path=${path}&target_line_no=${line}&delimiter=${'%0A%0A'}`;
    dispatch(searchCodes(query, url))
  }
}))
export default class StackframeSearch extends React.Component {
  render() {
    const loading = this.props.search.pending ? <Spinner spinnerName='circle' noFadeIn /> : <div/>;
    return (
      <div>
        <div style={{background: 'white', display: 'flex'}}>
          <GitForm {...this.props} type={SEARCH_TYPE}>
            <GitFormInput size="3" name="repo" desc="repos (e.g. ul)" init="^ul" />
            <GitFormInput size="3" name="branch" desc="branches (e.g. HEAD)" init="HEAD" />
            <GitFormInput size="4" name="text" desc="search expression" init="" />
          </GitForm>
        </div>
        <GrepResult codes={this.props.search.data} />
        {loading}
      </div>
    );
  }
}