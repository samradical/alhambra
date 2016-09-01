import './main.scss';

import React from 'react'
import ReactDom from 'react-dom'
import { Provider } from 'react-redux';
import { createHistory } from 'history';
import { Router, useRouterHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import configureStore from './store/configure-store';
import configureRoutes from './routes/configure-routes';

import FastClick from 'fastclick';
FastClick.attach(document.body);

// Configure store and routes
const browserHistory = useRouterHistory(createHistory)({
  basename: process.env.APP_DOMAIN
});

const store = configureStore({
  browserHistory,
});
const histroy = syncHistoryWithStore(browserHistory, store);
const routes = configureRoutes();

ReactDom.render(
  <Provider store={store}>
    <Router history={histroy}>
      {routes}
    </Router>
  </Provider>, document.getElementById('app')
)
