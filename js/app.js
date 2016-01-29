import React from 'react'
import { render } from 'react-dom'
import { Router, Route, Link, browserHistory } from 'react-router'

import GitGrep from './components/GitGrep.js';

let App = React.createClass({  
  render() {
    return (
      <div className="nav">
        <Link to="/gitgrep">Git Grep</Link>

        {this.props.children}
      </div>
    );
  }
});

render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="gitgrep" component={GitGrep}/>
    </Route>
  </Router>
), document.getElementById('bundle'))

