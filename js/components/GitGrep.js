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
  search: state.search[SEARCH_TYPE] || {}
}), (dispatch) => ({
  doSearch: query => {
    const url = `${AppSettings.gitRestApi()}/repo/${query.repo}/grep/${query.branch}?q=${query.text}&path=${query.path}&delimiter=${'%0A%0A'}`;
    dispatch(searchCodes(query, url))
  }
}))
export default class GrepBox extends React.Component {
  render() {
    const loading = this.props.search.pending ? <Spinner spinnerName='circle' noFadeIn /> : <div/>;
    return (
      <div>
        <div style={{background: 'white', display: 'flex'}}>
          <GitForm {...this.props} type={SEARCH_TYPE}>
            <GitFormInput size="3" name="repo" desc="repos (e.g. ul)" init="^ul" />
            <GitFormInput size="2" name="branch" desc="branches (e.g. HEAD)" init="HEAD" />
            <GitFormInput size="3" name="path" desc="path (e.g. *.java)" init="." />
            <GitFormInput size="3" name="text" desc="search expression" init="" />
          </GitForm>
        </div>
        <GrepResult codes={this.props.search.data} />
        {loading}
      </div>
    );
  }
}