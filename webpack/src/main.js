import './main.scss';

import FastClick from 'fastclick';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import configureStore from './store/configure-store';
import configureRoutes from './routes/configure-routes';


// Configure store and routes
const store = configureStore({
  browserHistory,
});
const histroy = syncHistoryWithStore(browserHistory, store);
const routes = configureRoutes();

// Render app
const appEl = document.getElementById('app');
ReactDOM.render(
  <Provider store={store}>
    <Router history={histroy}>
    {routes}
    </Router>
  </Provider>,
  appEl
);

FastClick.attach(document.body);
