import { createBrowserHistory } from "history";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router } from 'react-router';
import App from './App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

const history = createBrowserHistory();

ReactDOM.render(
  <Router history={ history }><App history={ history } /></Router>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
