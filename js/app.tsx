/// <reference path="../typings/tsd.d.ts" />

import * as React from 'react'
import { render } from 'react-dom'
import * as ReactRouter from 'react-router'
import { prefix } from '../settings.tsx'

import GitGrep from './components/GitGrep.tsx'
import GitSearch from './components/GitSearch.tsx'

let App = ({children}) =>
  <div className="container-fluid theme-showcase">
    <nav className="navbar navbar-default">
      <div className="container">
        <div className="navbar-header">
          <ReactRouter.Link className="navbar-brand" to="/">GIT</ReactRouter.Link>
        </div>
        <div className="navbar-collapse collapse">
          <ul className="nav navbar-nav">
            <li><ReactRouter.Link to={prefix() + 'gitgrep'}>Grep</ReactRouter.Link></li>
            <li><ReactRouter.Link to={prefix() + 'gitsearch'}>Search</ReactRouter.Link></li>
          </ul>
        </div>
      </div>
    </nav>
    {children}
  </div>;

render((
  <ReactRouter.Router history={ReactRouter.browserHistory}>
    <ReactRouter.Route path={prefix()} component={App}>
      <ReactRouter.Route path="gitgrep" component={GitGrep}/>
      <ReactRouter.Route path="gitsearch" component={GitSearch}/>
    </ReactRouter.Route>
  </ReactRouter.Router>
), document.getElementById('bundle'))

