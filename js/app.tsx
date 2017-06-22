import * as React from 'react'
import { render } from 'react-dom'
import * as ReactRouter from 'react-router'
import { prefix } from '../settings'

import injectTapEventPlugin = require('react-tap-event-plugin')
injectTapEventPlugin()

import LeftNav = require('material-ui/lib/left-nav')
import AppBar = require('material-ui/lib/app-bar')

import GitGrep from './components/GitGrep'
import GitSearch from './components/GitSearch'
import PlainRoute = ReactRouter.PlainRoute;

let menuItems = [
  { route: prefix(), text: 'Home' },
  { route: prefix() + 'gitgrep', text: 'GIT Grep' },
  { route: prefix() + 'gitsearch', text: 'GIT Search' },
]

class App extends React.Component<{children: React.ReactNode[], routes: PlainRoute[]}, {nav?: boolean, title?: string}> {
  constructor(props) {
    super(props);
    this.state = {
      nav: false,
      title: menuItems[this.getSelectedIndex()].text,
    }
  }

  handleClick(e) {
    e.preventDefault();
    this.setState({nav: true})
  }

  getSelectedIndex() {
    let currentItem;
    let current_path = this.props.routes[this.props.routes.length-1].path
    for (let i = menuItems.length - 1; i >= 0; i--) {
      currentItem = menuItems[i];
      if (prefix() + current_path === currentItem.route) {
        return i;
      }
    }
  }

  onLeftNavChange(e, key, payload) {
    ReactRouter.browserHistory.pushState(null, payload.route)
    this.setState({
      nav: false,
      title: payload.text,
    })
  }

  render() {
    return (
      <div id="page_container">
        <LeftNav open={this.state.nav} docked={false} menuItems={menuItems} onRequestChange={open => this.setState({nav: open})}
          selectedIndex={this.getSelectedIndex()} onChange={this.onLeftNavChange.bind(this)} />
        <header>
          <AppBar title={this.state.title} onLeftIconButtonTouchTap={this.handleClick.bind(this)} />
        </header>
        {this.props.children}
        <section className="content">
        </section>
      </div>
    );
  }
}

render((
  <ReactRouter.Router history={ReactRouter.browserHistory}>
    <ReactRouter.Route path={prefix()} component={App}>
      <ReactRouter.Route path="gitgrep" component={GitGrep}/>
      <ReactRouter.Route path="gitsearch" component={GitSearch}/>
    </ReactRouter.Route>
  </ReactRouter.Router>
), document.getElementById('bundle'))

