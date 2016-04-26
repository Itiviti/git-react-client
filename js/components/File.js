import React from 'react';
import Spinner from 'react-spinkit';
import {connect} from 'react-redux';

import AppSettings from '../../settings';
import {Form, FormInput} from './search/Form';
import Result from './search/Result';
import {searchCodes, emptyQuery} from '../actions/search';

const SEARCH_TYPE = 'file';

@connect(state => ({
  search: state.search[SEARCH_TYPE] || emptyQuery
}), (dispatch) => ({
  doSearch: query => {
    const txt = query.text;
    let match, path, line = 1;
    // TODO: redirect to MS ref src
    if (match = txt.match(/([^.]+)\.[^.]+\(/)) {
      path = `*/${match[1]}.*`;
    } else if (match = txt.match(/(\w+)/)) {
      path = `*/${match[1]}.*`;
    }
    const url = `${AppSettings.gitRestApi()}/repo/${query.repo}/grep/${query.branch}?q=^&path=${path}&target_line_no=${line}&delimiter=${'%0A%0A'}`;
    dispatch(searchCodes(query, url));
  }
}))
export default class FileSearch extends React.Component {
  render() {
    const loading = this.props.search.pending ? <Spinner spinnerName='circle' noFadeIn /> : <div/>;
    return (
      <div>
        <div style={{background: 'white', display: 'flex'}}>
          <Form {...this.props} type={SEARCH_TYPE}>
            <FormInput size="3" name="repo" desc="repos (e.g. ul)" init="^ul" />
            <FormInput size="3" name="branch" desc="branches (e.g. HEAD)" init="HEAD" />
            <FormInput size="4" name="text" desc="search expression" init="" />
          </Form>
        </div>
        <Result codes={this.props.search.data} />
        {loading}
      </div>
    );
  }
}