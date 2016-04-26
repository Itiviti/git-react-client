import React from 'react';
import {render} from 'react-dom';
import {Router, Route, Link, browserHistory} from 'react-router';
import {Provider} from 'react-redux';

import '../css/prism.css';
import '../css/components/GitGrep.css';

import GrepSearch from './components/Grep';
import FileSearch from './components/File';
import StackframeSearch from './components/Stackframe';
import createStore from './store/storage';
import Settings from './components/Settings';

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
        <Route path="gitgrep" component={GrepSearch}/>
        <Route path="gitfile" component={FileSearch}/>
        <Route path="gitstackframe" component={StackframeSearch}/>
      </Route>
    </Router>
  </Provider>
), document.getElementById('bundle'));

