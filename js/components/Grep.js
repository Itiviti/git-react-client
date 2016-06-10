import React from 'react';
import Spinner from 'react-spinkit';
import {connect} from 'react-redux';

import AppSettings from '../../settings';
import {Form, FormInput} from './search/Form';
import Result from './search/Result';
import {searchCodes, emptyQuery} from '../actions/search';

const SEARCH_TYPE = 'grep';

@connect(state => ({
  search: state.search[SEARCH_TYPE] || emptyQuery
}), (dispatch) => ({
  doSearch: query => {
    const url = `${AppSettings.gitRestApi()}/repo/${query.repo}/grep/${query.branch}?q=${query.text}&path=${query.path}&delimiter=${'%0D%0A'}`;
    dispatch(searchCodes(query, url));
  }
}))
export default class GrepSearch extends React.Component {
  render() {
    const loading = this.props.search.pending ? <Spinner spinnerName='circle' noFadeIn /> : <div/>;
    return (
      <div>
        <div style={{background: 'white', display: 'flex'}}>
          <Form {...this.props} type={SEARCH_TYPE}>
            <FormInput size="3" name="repo" desc="repos (e.g. ul)" init="^ul" />
            <FormInput size="2" name="branch" desc="branches (e.g. HEAD)" init="HEAD" />
            <FormInput size="3" name="path" desc="path (e.g. *.java)" init="." />
            <FormInput size="3" name="text" desc="search expression" init="" />
          </Form>
        </div>
        <Result codes={this.props.search.data} />
        {loading}
      </div>
    );
  }
}