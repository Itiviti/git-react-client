import React from 'react';
import {render} from 'react-dom';
import {Router, Route, Link, browserHistory} from 'react-router';
import {Provider} from 'react-redux';

import GitGrep from './components/GitGrep.js';
import GitFile from './components/GitFile.js';
import GitStackframe from './components/GitStackframe.js';
import createStore from './store/storage';
import Settings from './components/GitSettings';

var RouteHandler = Router.RouteHandler;
let App = ({children}) =>
  <div className="container-fluid theme-showcase">
    <nav className="navbar navbar-inverse">
      <div className="container">
        <div className="navbar-header">
          <Link className="navbar-brand" to="/">GIT</Link>
        </div>
        <div className="navbar-collapse collapse">
          <ul className="nav navbar-nav">
            <li><Link to="/gitgrep">Grep</Link></li>
            <li><Link to="/gitfile">File</Link></li>
            <li><Link to="/gitstackframe">Search</Link></li>
          </ul>
          <ul className="nav navbar-nav navbar-right">
            <li><Settings /></li>
          </ul>
        </div>
      </div>
    </nav>
    {children}
  </div>;

const store = createStore();

render((
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <Route path="gitgrep" component={GitGrep}/>
        <Route path="gitfile" component={GitFile}/>
        <Route path="gitstackframe" component={GitStackframe}/>
      </Route>
    </Router>
  </Provider>
), document.getElementById('bundle'));

